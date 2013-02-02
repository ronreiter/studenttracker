from studenttracker.decorators import user_required
from studenttracker.models import *
import tornado.web, tornado.ioloop

import itertools
import re
import calendar

def get_raw_tweet(query):
    return re.sub("[@#]\S+\s?", "", query).strip()

class TweetsHandler(tornado.web.RequestHandler):
    def _parse_query_string(self, query_string):
        """
        Parses the query string in the form of
        @(number) - student number
        #(tag) - a tag
        :param query_string: the query search string
        :return: students, tags parsed from the query string
        """
        students = [int(student_number) for student_number in re.findall("@(\S+)", query_string) if student_number.isdigit()]
        tags = re.findall("#(\S+)", query_string)

        return students, tags

    @user_required
    def get(self):
        tweets = []
        student_ids = []
        lesson_ids = []

        tweet_query = Tweet.objects
        query = self.get_argument("q", None)
        lesson_id = self.get_argument("lesson", None)
        subject_id = self.get_argument("subject", None)
        student_id = self.get_argument("student", None)

        if query: # the search bar search query
            students, tags = self._parse_query_string(query)

            if students:
                queried_students = Student.objects.filter(number__in = students, year = self.user.year)
                student_ids.extend(queried_students)

            if tags:
                # AND QUERY
                tweet_query = tweet_query.filter(tags__all = tags)
                # OR QUERY
                #tweet_query = tweet_query.filter(tags__in = tags)

            raw_query = get_raw_tweet(query)
            if raw_query:
                tweet_query = tweet_query.filter(text__contains = raw_query)

        start = int(self.get_argument("start", 0)) / 1000
        if start:
            tweet_query = tweet_query.filter(created__gte = datetime.datetime.fromtimestamp(start))

        end = int(self.get_argument("end", 0)) / 1000
        if end:
            tweet_query = tweet_query.filter(created__lte = datetime.datetime.fromtimestamp(end + 60 * 60 * 24))

        if student_id:
            tweet_query = tweet_query.filter(student = student_id)

        if subject_id:
            lesson_ids = list(Lesson.objects.filter(subject = Subject.objects.get(id=subject_id)))

        if lesson_id:
            tweet_query = tweet_query.filter(lesson = Lesson.objects.get(id=lesson_id))

        if not student_ids: # if a student was searched in the search box, ignore the followed students
            student_ids.extend(list(self.user.following))
            student_ids = list(set(student_ids))
        if student_ids: # this is checked because student ids can still be []
            tweet_query = tweet_query.filter(student__in = student_ids)

        lesson_ids += list(self.user.following_lesson)
        #lesson_ids += list(Lesson.objects.filter(subject__in = self.user.following_subject))

        #if lesson_ids:
        tweet_query = tweet_query.filter(lesson__in = lesson_ids)

        for tweet in tweet_query.order_by("-created"):
            tweets.append({
                "id" : str(tweet.id),
                "text" : tweet.text,
                "student" : str(tweet.student.id),
                "type" : tweet.type,
                "starred" : tweet.starred,
                "tags" : tweet.tags,
                "created" : calendar.timegm(tweet.created.timetuple()),
                "lesson" : str(tweet.lesson.id) if tweet.lesson else None,
                "user" : tweet.user.username,
            })

        self.write(json.dumps(tweets))

    @user_required
    def post(self):
        data = json.loads(self.request.body)
        new_tweet = Tweet(
            text = data["text"],
            student = Student.objects.get(id=data["student"]),
            lesson = Lesson.objects.get(id=data["lesson"]),
            type = data["type"],
            tags = re.findall("#(\S+)", data["text"]),
            user = self.user
        )
        new_tweet.save()

        #for client in clients:
        #	client.send("update")

        self.write(new_tweet.serialize())

class TweetHandler(tornado.web.RequestHandler):
    @user_required
    def put(self, id):
        data = json.loads(self.request.body)
        tweet_to_update = Tweet.objects.get(id=id)
        tweet_to_update.text = data["text"]
        tweet_to_update.type = data["type"]
        tweet_to_update.starred = data["starred"]
        tweet_to_update.tags = data["tags"]
        tweet_to_update.save()

        self.write(tweet_to_update.serialize())

    @user_required
    def delete(self, id):
        tweet_to_delete = Tweet.objects.get(id=id)
        tweet_to_delete.delete()
