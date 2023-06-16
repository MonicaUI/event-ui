# Event Guest Side Site

Event Guest Side UI

### Development Guide:

`pnpm COMMAND`


- build:  builds production asset bundle.
- dev: starts the webpack-dev-server / incremental compiler
- clean: removes dist folder.
- release: clean builds the app increments version and publishes to Cvent's internal npm registry with and pushes to stash.
  - Defaults to a "prerelease/snapshot build."
  - Use Jenkin's nucleus-release-deploy-build-flow create an official release.
- test: runs unit tests.
- lint: run eslint on code base.
- verify: runs unit tests, eslint, flow check.
- dev-prod: start server to host the local prod build as an SPA.

#### Initial Setup
See the "Additional Developer Setup" section in the README file at the root of this repo for instructions that must be completed prior to starting these setup instructions.

In this application directory, run `pnpm install`. This does not need to be repeated every time that you run the application, but should be repeated periodically to keep dependencies up to date.

Now choose one of the local development options below. "Local UI development with silo backend" is recommended for most use cases because it does not require any additional services to be set up.

#### Local UI development with silo backend

(Make sure you've run pnpm install first)

`pnpm dev`

This approach will use an alpha deployment of event-guestside-service to serve up data to the UI to let you develop
using real data without running your own deployment of event-guestside-service.

##### Normal Registration
Then navigate to https://${YOUR_HOST_NAME}:8083/events/{eventId}?environment=S608 to view the guestside page.

##### Planner Registration
Navigate to https://${YOUR_HOST_NAME}:8083/Subscribers/Login.aspx to login to the application. Once
you have done that you will be able to visit site editor pages such as
https://${YOUR_HOST_NAME}:8083/subscribers/events2/PlannerRegistration/Flex?evtstub=4f547851-b84a-40d3-ac4e-2cc2f07ce742

NOTE: If the script does not detect your IP address correctly, you may need to pass it in as a variable, e.g. `DEV_IP=10.11.12.13
pnpm dev`.

NOTE: It is recommended that you visit the site using your computer's host-name (find this by running `hostname`)
instead of using localhost or your IP address because some browsers handle some features such as cookies differently
when visiting a site using localhost or an IP address.

If you want to use a non-default silo you can use the DEV_SILO variable to control that, e.g.
`DEV_SILO=608 pnpm dev`.

#### Local UI development with local event-guestside-service

`DEV_SERVICE_URL=http://${YOUR_IP_ADDRESS}:1999/dev pnpm dev`

This approach will let you develop against a local instance of event-guestside-service to let you develop on
event-guestside-service at the same time that you are developing on the UI.

Provide the address of your local event-guestside-service instance in the variable DEV_SERVICE_URL (do not use localhost).

You may need to be on VPN for this to work.

#### Local UI development with local event-ui-apollo-server

`DEV_APOLLO_SERVER=http://localhost:3000 pnpm dev`

This approach will let you develop against a local instance of event-ui-apollo-server (a GraphQL server) at the same time that you are developing on the UI. Note that the event-ui-apollo-server package is located in this repo under `cdk/event-ui-apollo-server`.

#### Local UI development with local Normandy backend

Follow [this guide](https://wiki.cvent.com/display/~TMorehouse/Setup+local+Normandy+to+point+to+Alpha+DB) to point
your local Normandy instance to the alpha region that your UI is using (default is S608).

`DEV_BACKEND=10.21.22.23 pnpm dev`

This approach will let you develop against a local instance of Normandy to let you develop on Normandy at the same
time that you are developing on the UI.

Provide the address of your local Normandy instance in the variable DEV_BACKEND (do not use localhost).

#### Local UI development with dummy data (USE AT YOUR OWN RISK)

`pnpm dev`

This approach will use local fixtures to provide fake data to the UI. See the fixtures directory to modify the dummy
data. Use the url http://localhost:8081/ to visit the guestside.

### Project Layout

Using [Ducks](https://github.com/erikras/ducks-modular-redux)

+

/components for “dumb” React components unaware of Redux;
/containers for “smart” React components connected to Redux;

