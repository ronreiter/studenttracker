import functools
from studenttracker.models import *

def user_required(method):
	"""Decorator for getting the user through a secure cookie user identifier"""
	@functools.wraps(method)
	def wrapper(self, *args, **kwargs):
		user_id = self.get_secure_cookie("user_id")

		if user_id:
			self.user = User.objects.get(id=user_id)
		else:
			self.redirect("/login")
			return

		method(self, *args, **kwargs)

	return wrapper
