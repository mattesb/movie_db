#!/usr/bin/env python3
"""
Initialize the database with admin and demo users
Run this script after database migration
"""

import os
from app import app, db, User

def init_users():
    """Initialize the database with demo users"""
    with app.app_context():
        # Create tables
        db.create_all()

        # Check if admin user already exists
        admin_user = User.query.filter_by(username='admin').first()
        if not admin_user:
            # Create admin user
            admin_user = User(
                username='admin',
                email='admin@example.com',
                role='admin'
            )
            admin_user.set_password('admin')
            db.session.add(admin_user)
            print("Created admin user: admin/admin")
        else:
            print("Admin user already exists")

        # Check if demo user already exists
        demo_user = User.query.filter_by(username='user').first()
        if not demo_user:
            # Create demo user
            demo_user = User(
                username='user',
                email='user@example.com',
                role='user'
            )
            demo_user.set_password('user')
            db.session.add(demo_user)
            print("Created demo user: user/user")
        else:
            print("Demo user already exists")

        # Commit changes
        db.session.commit()
        print("Database initialization complete!")

if __name__ == '__main__':
    init_users()