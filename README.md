# Udemy Clone - Sidebar

![Sidebar on page load](/readme_assets/sidebar_on_page_load.png)

## Table of Contents

1. Overview
2. Installation
3. Database
4. API

## Overview

### Background

This is the Sidebar service for a Udemy clone. It is part of a group project on service-oriented architecture; you can find the other relevant repositories at https://github.com/Charlotte-Badger.

The Sidebar API provides price information (including information related to discounts and sales), video and preview image information, and information related to access, assignments, certificates of completion, and downloadable resources. In rendering the Sidebar, the service pulls information about hours of video, number of articles, coding exercises, lectures, and quizzes from the related Course-Content API.

![Sidebar alone](/readme_assets/sidebar_alone.png)

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

## Installation and Start

1. From root directory: `npm install`.
2. Create file named `.env`, using the template provided at `.env-sample`.
   * NODE_ENV defaults to "development"; "production" is the other possible choice (which will tell Webpack to build a more efficent client, at the expense of some helpful development features).
   * Sidebar will assume PUBLIC_HOST and PRIVATE_HOST are both localhost, if those aren't provided.
   * Database population will only work if ASSET_URL exists. Sample images and videos provided at /public/assets for your convenience.
   * COURSE_CONTENT_URL needs to point to that API, if you want the full experience. The Course Content service must therefore be running somewhere (which may require you to install and run that too; see: https://github.com/Charlotte-Badger/Course-Content).
3. Install and run MongoDB (see: https://docs.mongodb.com/manual/installation/).
4. `npm run pop` to populate the database.
5. Build the client with `npm run build` or (if you want to put in in watch mode) `npm run dev`.
6. Start the server with `npm start`.
7. Navigate to localhost:3004 (or whatever URL and port you specified in `.env`).
8. Add `?courseId=` and then a number between 1 and 100, inclusive, to see it render with information from the different records in the database.
9. `npm run ec2` will log you in to an EC2 instance, but you'll need to modify the ec2 script in `package.json` to add a path to your .pem file and EC2 instance.

## Database

Populate the database with `npm run pop`; this will create 100 records in three tables: 'Price', 'PreviewVideo', and 'Sidebar'.

Price Schema:

  courseId: Number,
  basePrice: Number,
  discountPercentage: Number,
  discountedPrice: Number,
  saleEndDate: Date,
  saleOngoing: Boolean
  
PreviewVideo Schema:

  courseId: Number,
  previewVideoUrl: String,
  previewVideoImgUrl: String
  
Sidebar Schema:

  courseId: Number,
  fullLifetimeAccess: String,
  accessTypes: String,
  assignments: Boolean,
  certificateOfCompletion: Boolean,
  downloadableResources: Number
  
## API

The API has three routes (the numbers can be replaced with any integer between 1 and 100, inclusive):

/price?courseId=27

	{
  "courseId": Number,
  “basePrice”: Number,
  “discountPercentage”: Number,
  “discountedPrice”: Number,
  “saleEndDate”: Date,
  “saleOngoing”: Boolean
}

/previewVideo?courseId=42

 {
  "courseId": Number,
  “previewVideoURL”: String,
  “previewVideoImgURL”: String
 }


/sidebar?courseId=98

 {
  “fullLifetimeAccess”: String,
  “accessTypes”: String,
  “certificateOfCompletion”: Boolean
 }

