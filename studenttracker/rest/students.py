from studenttracker.decorators import user_required
from studenttracker.models import *
import tornado.web, tornado.ioloop

class StudentsHandler(tornado.web.RequestHandler):
	@user_required
	def get(self):
		students = []

		for student in Student.objects.filter(year = self.user.year).order_by("number"):
			students.append({
				"id" : str(student.id),
				"number" : student.number,
				"name" : student.name,
				"personal_id" : student.personal_id,
				"personal_number" : student.personal_number,
				"ldap_username" : student.ldap_username,
				"image" : student.image,
				"following" : student in self.user.following,
			})

		self.write(json.dumps(students))

	@user_required
	def post(self):
		data = json.loads(self.request.body)
		new_student = Student(
			number = data["number"],
			name = data["name"],
			year = self.user.year,
			personal_number = data["personal_number"],
			personal_id = data["personal_id"],
			ldap_username = data["ldap_username"],
			#image = data["image"]
		)
		new_student.save()

		self.write(json.dumps({
			"id" : str(new_student.id),
			"number" : new_student.number,
			"name" : new_student.name,
			"personal_number" : new_student.personal_number,
			"personal_id" : new_student.personal_id,
			"ldap_username" : new_student.ldap_username,
		}))

		#for client in clients:
		#	client.send("update")

class StudentHandler(tornado.web.RequestHandler):
	@user_required
	def put(self, id):
		data = json.loads(self.request.body)
		student_to_update = Student.objects.get(id=id)
		student_to_update.number = data["number"]
		student_to_update.name = data["name"]
		student_to_update.personal_number = data["personal_number"]
		student_to_update.personal_id = data["personal_id"]
		student_to_update.ldap_username = data["ldap_username"]
		student_to_update.image = data["image"]
		student_to_update.save()

		if data["following"]:
			if student_to_update not in self.user.following:
				self.user.following.append(student_to_update)
		else:
			if student_to_update in self.user.following:
				self.user.following.remove(student_to_update)

		self.user.save()

		self.write(self.request.body)

	@user_required
	def delete(self, id):
		student_to_delete = Student.objects.get(id=id)
		student_to_delete.delete()

