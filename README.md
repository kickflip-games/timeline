# Timeline
Game for Ludum Dare 53

* [itchio page](https://avivajpeyi.itch.io/timeline)
* [Ludum Dare page](https://ldjam.com/events/ludum-dare/53/timeline)
* [Gameplay video](https://youtu.be/Hdb3hOP9_WU)
* [Scraped data](https://docs.google.com/spreadsheets/d/e/2PACX-1vQOm2RXLcHTIyUOBbGSHHNYt7QeK_RbDtBxGqRZ74XDed6r7LYWJCkKOo13PoZCQJiguWCIuhtyYLu6/pubhtml?gid=0&single=true)


<img src="https://static.jam.host/raw/a3d/11/z/58c91.png"  width="600">


* Web scraping tools in the python src dir: `timeline_data_generator`
* Unity src in `timeline` dir

## Web Deployment

The TypeScript web app in `timeline_web` is configured to deploy with GitHub Pages through the workflow at `.github/workflows/deploy-timeline-web.yml`.

The workflow:

* installs dependencies from `timeline_web/package-lock.json`
* builds the Vite app from `timeline_web`
* deploys `timeline_web/dist` with the official GitHub Pages actions

Repository settings needed on GitHub:

* go to Settings > Pages
* set Source to GitHub Actions

The Vite config automatically uses `/timeline/` as the base path when the app is built in GitHub Actions for this repository, while keeping `/` for local development.
