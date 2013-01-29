from studenttracker.decorators import user_required
from studenttracker.models import *
import tornado.web, tornado.ioloop

class SubjectsHandler(tornado.web.RequestHandler):
	@user_required
	def get(self):
		subjects = []
		for subject in Subject.objects.order_by("name"):
			subjects.append({
				"id" : str(subject.id),
				"name" : subject.name,
				"following" : subject in self.user.following_subject,
			})

		self.write(json.dumps(subjects))

	@user_required
	def post(self):
		data = json.loads(self.request.body)
		new_subject = Subject(
			name = data["name"],
		)
		new_subject.save()
		self.write(json.dumps({
			"id" : str(new_subject.id),
			"name" : data["name"]
		}))

class SubjectHandler(tornado.web.RequestHandler):
	@user_required
	def put(self, id):
		data = json.loads(self.request.body)
		subject_to_update = Subject.objects.get(id=id)
		subject_to_update.name = data["name"]
		subject_to_update.save()

		if data["following"]:
			if subject_to_update not in self.user.following_subject:
				self.user.following_subject.append(subject_to_update)
		else:
			if subject_to_update in self.user.following_subject:
				self.user.following_subject.remove(subject_to_update)

		self.user.save()

		self.write(self.request.body)

	@user_required
	def delete(self, id):
		subject_to_delete = Subject.objects.get(id=id)
		subject_to_delete.delete()

