# Studenttracker

## Installation

First, check out or download this directory.

To install, you will need to install using setup.py.

	setup.py install

Since there are a few dependencies, you might want to create a virtualenv and copy it as-is from a server connected
to the internet to an isolated environment (not connected to the internet).

Run the following commands to set up the virtual environment:

	cd studenttracker
	virtualenv env
	source env/bin/activate
	python setup.py install

Copy the directory.

## Setup

Please make sure that the current year and the right database are used. Update config.py with the correct parameters.

Make sure the database is running:

	ps aux | grep mongod

or just run it:

	mongod

To run the server, just run main.py. You can either create a service script or use the "tmux" command, so execution
can be done in a permanent console. Example:

To run:

	tmux
	python main.py

To restart:

	tmux attach
	Ctrl+C
	python main.py
	Ctrl+b D (detach screen) 

## Usage

Just start up the website, add students, subjects and lessons, and you're good to go.

