# Udemy Clone - Sidebar

![Sidebar on page load](/readme_assets/sidebar_on_page_load.png)

## Table of Contents

1. Overview
2. Installation
3. Database
4. API
5. Testing

## Overview

### Background

This is the Sidebar service for a Udemy clone. It is part of a group project on service-oriented architecture; you can find the other relevant repositories at https://github.com/Charlotte-Badger.

The Sidebar API provides price information (including information related to discounts and sales), video and preview image information, and information related to access, assignments, certificates of completion, and downloadable resources. In rendering the Sidebar, the service pulls information about hours of video, number of articles, coding exercises, lectures, and quizzes from the related Course-Content API.

### Technologies

* React
* Node.js
* Express
* MongoDB
* AWS S3
* AWS EC2
* Jest

### Highlights

* Preview video overlay gradient, overlay text, original SVG to match Udemy site
* Works with proxy to handle relatively complex behaviors on scroll
  * Starts positioned at top of page in line with other elements
  * Joins fixed overview bar as user scrolls down  
  * Attaches to other content behind fixed overview bar as user reaches the end of the page 

## Installation

1. From root directory: `npm install`
2. Create file named `.env`, using the template provided at `.env-sample`.
  * Sidebar will assume PUBLIC_HOST and PRIVATE_HOST are both localhost, if those aren't provided
  * Database population will only work if  
4. COURSE_CONTENT_URL pointing to that API, if you want the full experience


"npm start" to start the server

localhost:3004/populate to generate sample data and add it to a mongodb database (you may need to modify database.js depending on your mongodb installation)
