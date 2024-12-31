import tweepy
import json
import time
from datetime import datetime
import logging
import os
import subprocess
from pathlib import Path

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    filename='twitter_posts.log'
)

class TwitterPoster:
    def __init__(self):
        # Twitter API credentials
        self.api_key = "UHmjMnQmdzIeIDFxDdnFnWPBG"
        self.api_secret = "viMO4qiz6Aib1ZZUcY3PelD4gkiOVaLtDRHwdFk1hMyGSDXS4b"
        self.access_token = "8632762-4CCTKEzo9anFsySOvu5hLKmRPGirkfsNIyPypjySDr"
        self.access_token_secret = "IvFJo6eIZNIXB926VGOEUzPqAW8LIjJi3Ol5fRd9EEp7G"
        
        try:
            # Initialize API v2 client
            self.client = tweepy.Client(
                consumer_key=self.api_key,
                consumer_secret=self.api_secret,
                access_token=self.access_token,
                access_token_secret=self.access_token_secret,
                wait_on_rate_limit=True
            )
            
            # Initialize v1.1 API for media uploads
            self.auth = tweepy.OAuth1UserHandler(
                self.api_key,
                self.api_secret,
                self.access_token,
                self.access_token_secret
            )
            self.api = tweepy.API(self.auth, wait_on_rate_limit=True)
            
            # Test connection immediately
            self._test_connection()
            
        except Exception as e:
            logging.error(f"Error initializing Twitter API: {str(e)}")
            raise

    def _test_connection(self):
        """Test the API connection with a simple me() call"""
        try:
            me = self.client.get_me()
            if me.data:
                logging.info(f"Successfully authenticated as: @{me.data.username}")
                return True
            else:
                logging.error("Could not verify credentials")
                return False
        except Exception as e:
            logging.error(f"Connection test failed: {str(e)}")
            return False

    def post_tweet(self, text):
        """Post a tweet with error handling and logging"""
        try:
            if len(text) > 280:
                logging.warning("Tweet text exceeds 280 characters, truncating...")
                text = text[:277] + "..."

            response = self.client.create_tweet(text=text)
            
            if response and response.data:
                tweet_id = response.data['id']
                logging.info(f"Successfully posted tweet: {text[:50]}...")
                return tweet_id
            else:
                logging.error("No response data received from Twitter")
                return None
            
        except tweepy.TweepyException as e:
            logging.error(f"Tweepy error posting tweet: {str(e)}")
            if "403" in str(e):
                logging.error("""
                Permission Error. Please verify:
                1. App permissions are set to 'Read and Write'
                2. Access tokens were regenerated after permission change
                3. User authentication settings include OAuth 1.0a
                """)
            return None
        except Exception as e:
            logging.error(f"Unexpected error posting tweet: {str(e)}")
            return None

    def retweet(self, tweet_id):
        """Retweet a tweet with error handling and logging"""
        try:
            self.client.retweet(tweet_id)
            logging.info(f"Successfully retweeted tweet ID: {tweet_id}")
            return True
        except tweepy.TweepyException as e:
            logging.error(f"Tweepy error retweeting: {str(e)}")
            return False
        except Exception as e:
            logging.error(f"Unexpected error retweeting: {str(e)}")
            return False

    def save_post_history(self, tweet_id, tweet_text):
        """Save posted tweet information to a JSON file"""
        history_file = 'twitter_post_history.json'
        try:
            if os.path.exists(history_file):
                with open(history_file, 'r') as f:
                    history = json.load(f)
            else:
                history = []

            history.append({
                'tweet_id': tweet_id,
                'text': tweet_text,
                'timestamp': datetime.now().isoformat()
            })

            with open(history_file, 'w') as f:
                json.dump(history, f, indent=2)
            
            logging.info(f"Successfully saved tweet history to {history_file}")
        except Exception as e:
            logging.error(f"Error saving post history: {str(e)}")

    def _get_video_duration(self, video_path):
        """Get duration of video in seconds using ffmpeg"""
        try:
            cmd = [
                'ffprobe', 
                '-v', 'error', 
                '-show_entries', 'format=duration', 
                '-of', 'default=noprint_wrappers=1:nokey=1', 
                video_path
            ]
            output = subprocess.check_output(cmd).decode().strip()
            return float(output)
        except Exception as e:
            logging.error(f"Error getting video duration: {str(e)}")
            return None

    def _trim_video(self, input_path, max_duration=140):
        """Trim video to specified duration using ffmpeg"""
        try:
            # Create output path
            input_path = Path(input_path)
            output_path = input_path.parent / f"{input_path.stem}_trimmed{input_path.suffix}"
            
            # Construct ffmpeg command
            cmd = [
                'ffmpeg',
                '-i', str(input_path),
                '-t', str(max_duration),
                '-c', 'copy',  # This copies streams without re-encoding
                '-y',  # Overwrite output file if it exists
                str(output_path)
            ]
            
            # Run ffmpeg
            logging.info(f"Trimming video to {max_duration} seconds...")
            subprocess.run(cmd, check=True, capture_output=True)
            
            return str(output_path)
        except Exception as e:
            logging.error(f"Error trimming video: {str(e)}")
            return None

    def post_tweet_with_video(self, text, video_path):
        """Post a tweet with a video"""
        try:
            # Verify file exists
            if not os.path.exists(video_path):
                logging.error(f"Video file not found: {video_path}")
                return None

            # Check file size (Twitter limit is 512MB)
            file_size = os.path.getsize(video_path) / (1024 * 1024)  # Convert to MB
            if file_size > 512:
                logging.error(f"Video file too large: {file_size}MB (max 512MB)")
                return None

            # Check video duration
            duration = self._get_video_duration(video_path)
            if duration is None:
                logging.error("Could not determine video duration")
                return None
            
            # If video is longer than 140 seconds (2:20), trim it
            if duration > 140:
                logging.warning(f"Video duration ({duration}s) exceeds Twitter limit (140s)")
                trimmed_path = self._trim_video(video_path)
                if trimmed_path is None:
                    logging.error("Failed to trim video")
                    return None
                video_path = trimmed_path
                logging.info(f"Using trimmed video: {video_path}")

            logging.info(f"Uploading video: {video_path}")
            
            # Upload media
            media = self.api.media_upload(
                filename=video_path,
                media_category='tweet_video'
            )

            # Check upload status
            if hasattr(media, 'processing_info'):
                self._wait_for_media_processing(media)

            # Post tweet with media
            response = self.client.create_tweet(
                text=text,
                media_ids=[media.media_id]
            )

            # Clean up trimmed video if it was created
            if 'trimmed' in str(video_path):
                try:
                    os.remove(video_path)
                    logging.info("Cleaned up trimmed video file")
                except Exception as e:
                    logging.warning(f"Could not clean up trimmed video: {str(e)}")

            if response and response.data:
                tweet_id = response.data['id']
                logging.info(f"Successfully posted tweet with video: {text[:50]}...")
                return tweet_id
            else:
                logging.error("No response data received from Twitter")
                return None

        except tweepy.TweepyException as e:
            logging.error(f"Tweepy error posting tweet with video: {str(e)}")
            return None
        except Exception as e:
            logging.error(f"Unexpected error posting tweet with video: {str(e)}")
            return None

    def _wait_for_media_processing(self, media):
        """Wait for media processing to complete"""
        while True:
            try:
                processing_info = self.api.get_media_upload_status(media.media_id)
                state = processing_info.processing_info['state']
                
                logging.info(f"Media processing state: {state}")
                
                if state == 'succeeded':
                    logging.info("Media processing completed successfully")
                    return True
                elif state == 'failed':
                    logging.error("Media processing failed")
                    return False
                    
                # If still processing, wait and check again
                if 'check_after_secs' in processing_info.processing_info:
                    wait = processing_info.processing_info['check_after_secs']
                    logging.info(f"Waiting {wait} seconds for processing...")
                    time.sleep(wait)
                else:
                    time.sleep(5)
                    
            except Exception as e:
                logging.error(f"Error checking media status: {str(e)}")
                return False

def main():
    try:
        poster = TwitterPoster()
        
        # Example with video
        video_path = '/Users/jonathanmann/Library/CloudStorage/Dropbox-SongADAO/Jonathan Mann/HUGH MANN/Every Single Song A Day Ever/Every Song A Day Video/5747.mp4'  # Update this path
        tweet_text = "apparently even though i pay for premium, you are limited to 2:20 of video via api so this is now a test to see if i can have the script trim the video automatically if it's over that"
        tweet_id = poster.post_tweet_with_video(tweet_text, video_path)
        
        if tweet_id:
            poster.save_post_history(tweet_id, tweet_text)
            print(f"Successfully posted tweet with video! ID: {tweet_id}")
        else:
            print("Failed to post tweet. Check the logs for details.")
    except Exception as e:
        logging.error(f"Main execution error: {str(e)}")
        print(f"An error occurred. Check twitter_posts.log for details.")

if __name__ == "__main__":
    main() 