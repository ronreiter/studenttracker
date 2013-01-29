from setuptools import setup, find_packages

setup(
	name='studenttracker',
	version='1.0',
	description='Student Tracking Web Service',
	author='Ron Reiter',
	author_email='ron.reiter@gmail.com',
	install_requires=["tornado", "mongoengine", "sockjs-tornado","tornadomail"]
)
