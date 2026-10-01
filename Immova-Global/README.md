# Immova Global Website

Premium single-page immigration and visa consultancy website built with:
- HTML5
- CSS3
- Vanilla JavaScript

## Folder structure

Immova-Global/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
└── assets/
    ├── logo.png
    ├── founder.jpg
    └── countries/
        ├── canada.jpg
        ├── australia.jpg
        ├── europe.jpg
        ├── ireland.jpg
        ├── new-zealand.jpg
        ├── turkey.jpg
        ├── uk.jpg
        └── usa.jpg

## Before deployment

1. Replace `assets/founder.jpg` with the founder's approved professional portrait.
2. Add the final `logo.png`.
3. The country/hero images currently use optimized remote Unsplash URLs. For maximum performance and full asset ownership, download approved images and update the `<img>` paths to local files.
4. Set up Formspree:
   - Create a Formspree form that forwards submissions to `immovaglobal@gmail.com`.
   - Copy the form endpoint ID.
   - In `index.html`, replace `YOUR_FORMSPREE_ID` in:
     `https://formspree.io/f/YOUR_FORMSPREE_ID`
5. Test the form on the deployed domain.
6. Update the Privacy Policy link with the final legal/privacy page before public launch.

## Important

The site intentionally does not state exact visa validity periods, guaranteed processing times, approval rates, government partnerships, awards, or unverified document lists. Visa requirements and decisions are dependent on the relevant authority and individual circumstances.
