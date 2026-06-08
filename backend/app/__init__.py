"""
Flask Application Factory
Creates and configures the Flask app with all extensions and blueprints.
"""

import os
from flask import Flask
from .config import config_map
from .extensions import db, jwt, cors


def create_app(env: str = None) -> Flask:
    """Create and return the configured Flask application."""

    app = Flask(__name__)

    # Load configuration
    env = env or os.getenv("FLASK_ENV", "development")
    app.config.from_object(config_map.get(env, config_map["development"]))

    # Ensure upload folder exists
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
 cors.init_app(app, resources={r"/api/*": {"origins": ["https://resume-bay-rho.vercel.app", "https://smart-resume-scanner1.vercel.app"]}})

    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.resumes import resumes_bp
    from .routes.jobs import jobs_bp
    from .routes.analysis import analysis_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(resumes_bp, url_prefix="/api/resumes")
    app.register_blueprint(jobs_bp, url_prefix="/api/jobs")
    app.register_blueprint(analysis_bp, url_prefix="/api/analysis")

    # Create tables
    with app.app_context():
        db.create_all()
        _seed_demo_data()

    return app


def _seed_demo_data():
    """Seed demo recruiter/candidate accounts if DB is empty."""
    from .models.user import User
    from .models.job import Job
    from werkzeug.security import generate_password_hash

    if User.query.first():
        return  # Already seeded

    recruiter = User(
        name="Alex Recruiter",
        email="recruiter@demo.com",
        password_hash=generate_password_hash("demo1234"),
        role="recruiter",
    )
    candidate = User(
        name="Sam Candidate",
        email="candidate@demo.com",
        password_hash=generate_password_hash("demo1234"),
        role="candidate",
    )
    db.session.add_all([recruiter, candidate])
    db.session.flush()

    demo_job = Job(
        recruiter_id=recruiter.id,
        title="Senior Python Developer",
        description=(
            "We are looking for an experienced Python developer with strong "
            "knowledge of Flask, Django, REST APIs, and cloud services. "
            "Experience with machine learning and data science is a big plus. "
            "Skills: Python, Flask, Django, REST API, SQL, PostgreSQL, AWS, Docker, Git."
        ),
    )
    # Use property setter (not constructor) for JSON-backed fields
    demo_job.required_skills = ["Python", "Flask", "Django", "REST API", "SQL", "PostgreSQL", "AWS", "Docker", "Git"]
    db.session.add(demo_job)
    db.session.commit()
