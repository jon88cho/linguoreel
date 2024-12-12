from setuptools import setup, find_packages

# Read dependencies from requirements.txt
with open("requirements.txt") as f:
    required_packages = f.read().splitlines()

# Read the contents of README.md from the parent directory
with open("../README.md", "r") as f:
    long_description = f.read()

setup(
    name="LinguoReel",  # Replace with your app's name
    version="1.0.0",  # Version of your app
    author="Jonathan Cho",
    author_email="jon88cho@gmail.com",
    description="An app to help you learn languages while watching TV.",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/jon88cho/linguoreel",  # Optional
    packages=find_packages(),  # Automatically find all Python packages in your project
    install_requires=required_packages,  # Automatically load dependencies from requirements.txt
    entry_points={
        "console_scripts": [
            "myapp=app:run_app",  # Adjust this based on your app's structure
        ]
    },
    include_package_data=True,
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: MacOS",
    ],
    python_requires=">=3.10",  # Ensure compatibility with Python 3.7+
)
