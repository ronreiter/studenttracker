from mongoengine import *
import json
import calendar
import datetime

class User(Document):
	username = StringField(required=True)
	password = StringField(required=True)
	following = ListField(ReferenceField("Student"))
	following_lesson = ListField(ReferenceField("Lesson"))
	following_subject = ListField(ReferenceField("Subject"))
	year = IntField()

class Subject(Document):
	name = StringField(required=True)

class Lesson(Document):
	subject = ReferenceField("Subject", reverse_delete_rule=CASCADE, required=True)
	name = StringField(required=True)

class Student(Document):
	number = IntField(required=True)
	name = StringField(required=True)
	year = IntField(required=True)
	created = DateTimeField(default=datetime.datetime.utcnow)
	personal_number = StringField(required=True)
	personal_id = StringField(required=True)
	ldap_username = StringField()
	image = StringField()

class Tweet(Document):
	created = DateTimeField(default=datetime.datetime.utcnow)
	text = StringField(required=True)
	user = ReferenceField("User", reverse_delete_rule=CASCADE, required=True)
	student = ReferenceField("Student", reverse_delete_rule=CASCADE, required=True)
	lesson = ReferenceField("Lesson", reverse_delete_rule=CASCADE, required=True)
	type = StringField(required=True)
	tags = ListField(StringField())
	starred = BooleanField(default=False)

	def serialize(self):
		return {
			"id" : str(self.id),
			"created" : calendar.timegm(self.created.timetuple()),
			"text" : self.text,
			"user" : str(self.user.id),
			"student" : str(self.student.id),
			"type" : self.type,
			"tags" : self.tags,
			"starred" : self.starred,
			"lesson" : str(self.lesson.id) if self.lesson else None,
			"username" : self.user.username # redundant
		}

