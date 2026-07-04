#!/usr/bin/env python3
"""Filter large files (> 1MB) from git history"""
import os
from git_filter_repo import FilteringFunction

def filter_large_files(repo_filter):
    def callback(file_data):
        if file_data.data and len(file_data.data) > 1024 * 1024:
            print(f"Filtering: {file_data.path.decode('utf-8', errors='replace')} ({len(file_data.data)} bytes)")
            file_data.skip_file()
        return file_data
    
    return callback

if __name__ == "__main__":
    from git_filter_repo import run
    run(filter_large_files)
