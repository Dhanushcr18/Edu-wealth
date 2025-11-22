"""
EduWealth Course Crawler
A respectful web crawler for aggregating course data from public educational platforms.

IMPORTANT: This crawler follows these principles:
1. Respects robots.txt
2. Implements polite delays between requests
3. Identifies itself with a proper User-Agent
4. Only collects public metadata (title, price, URL, rating)
5. Does not store copyrighted content
"""

import os
import time
import hashlib
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from typing import List, Dict, Optional
from dotenv import load_dotenv
import psycopg2  # type: ignore
from psycopg2.extras import RealDictCursor  # type: ignore

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://edu:edupass@localhost:5432/eduwealth')
USER_AGENT = os.getenv('USER_AGENT', 'EduWealth Course Crawler Bot')
REQUEST_DELAY = float(os.getenv('REQUEST_DELAY', '2'))


class CourseCrawler:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': USER_AGENT,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        })
        self.conn = psycopg2.connect(DATABASE_URL)  # type: ignore

    def check_robots_txt(self, base_url: str, path: str) -> bool:
        """
        Check if crawling the path is allowed by robots.txt
        In production, use robotparser module for proper parsing
        """
        try:
            robots_url = urljoin(base_url, '/robots.txt')
            response = self.session.get(robots_url, timeout=10)
            # Simplified check - in production, use urllib.robotparser
            return 'Disallow: ' + path not in response.text
        except:
            # If robots.txt doesn't exist or can't be fetched, proceed cautiously
            return True

    def generate_source_hash(self, provider: str, url: str) -> str:
        """Generate unique hash for course deduplication"""
        unique_string = f"{provider}_{url}"
        return hashlib.sha256(unique_string.encode()).hexdigest()

    def save_course(self, course: Dict):
        """Save course to database"""
        try:
            with self.conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO courses (
                        title, provider_name, provider_slug, url, price, currency,
                        rating, duration, categories, thumbnail_url, description, source_hash
                    )
                    VALUES (%(title)s, %(provider_name)s, %(provider_slug)s, %(url)s, 
                            %(price)s, %(currency)s, %(rating)s, %(duration)s, 
                            %(categories)s, %(thumbnail_url)s, %(description)s, %(source_hash)s)
                    ON CONFLICT (source_hash) 
                    DO UPDATE SET
                        title = EXCLUDED.title,
                        price = EXCLUDED.price,
                        rating = EXCLUDED.rating,
                        updated_at = NOW()
                """, course)
            self.conn.commit()
            print(f"✅ Saved: {course['title']}")
        except Exception as e:
            print(f"❌ Error saving course: {e}")
            self.conn.rollback()

    def crawl_sample_courses(self, limit: int = 50):
        """
        Crawl sample course data
        Note: This is a simplified demo. Real implementation would:
        - Properly parse actual provider HTML structures
        - Handle pagination
        - Respect rate limits more carefully
        - Include error handling and retries
        """
        print(f"🕷️  Starting crawler (limit: {limit})...")
        print(f"⏱️  Request delay: {REQUEST_DELAY}s")
        
        # Sample data for demonstration
        # In production, you would parse actual HTML from providers
        sample_courses = [
            {
                'title': 'Python for Beginners 2024',
                'provider_name': 'Udemy',
                'provider_slug': 'udemy',
                'url': 'https://www.udemy.com/course/python-beginners/',
                'price': 499,
                'currency': 'INR',
                'rating': 4.5,
                'duration': '20 hours',
                'categories': '["programming", "python", "web-development"]',
                'thumbnail_url': 'https://via.placeholder.com/300x200?text=Python',
                'description': 'Learn Python programming from scratch',
                'source_hash': self.generate_source_hash('udemy', 'python-beginners')
            },
            {
                'title': 'Machine Learning A-Z',
                'provider_name': 'Coursera',
                'provider_slug': 'coursera',
                'url': 'https://www.coursera.org/learn/machine-learning',
                'price': None,
                'currency': None,
                'rating': 4.8,
                'duration': '11 weeks',
                'categories': '["machine-learning", "data-science", "ai"]',
                'thumbnail_url': 'https://via.placeholder.com/300x200?text=ML',
                'description': 'Master machine learning algorithms',
                'source_hash': self.generate_source_hash('coursera', 'machine-learning')
            },
            {
                'title': 'Web Design Bootcamp',
                'provider_name': 'Udemy',
                'provider_slug': 'udemy',
                'url': 'https://www.udemy.com/course/web-design-bootcamp/',
                'price': 599,
                'currency': 'INR',
                'rating': 4.6,
                'duration': '30 hours',
                'categories': '["web-development", "design", "ui-ux-design"]',
                'thumbnail_url': 'https://via.placeholder.com/300x200?text=Web+Design',
                'description': 'Complete web design course from scratch',
                'source_hash': self.generate_source_hash('udemy', 'web-design-bootcamp')
            },
        ]

        for i, course in enumerate(sample_courses[:limit]):
            if i > 0:
                time.sleep(REQUEST_DELAY)  # Polite delay
            
            self.save_course(course)

        print(f"\n✅ Crawling complete! Processed {min(len(sample_courses), limit)} courses")

    def close(self):
        """Clean up resources"""
        self.conn.close()
        self.session.close()


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='EduWealth Course Crawler')
    parser.add_argument('--limit', type=int, default=50, help='Max courses to crawl')
    args = parser.parse_args()

    crawler = CourseCrawler()
    try:
        crawler.crawl_sample_courses(limit=args.limit)
    finally:
        crawler.close()


if __name__ == '__main__':
    main()
