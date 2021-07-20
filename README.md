# pdftron-sharepoint-web-part-sample
A simple SharePoint web part build with PDFTron WebViewer 

## Requirements

```
10.13 <= node <= 10.x
```

To manually install the latest version of `Node 10.x`:

https://nodejs.org/dist/latest-v10.x/

If you'd like to easily switch between versions of Node, check out [nvm](https://github.com/nvm-sh/nvm).

## Installation

To get started you'll need Yeoman and Gulp installed.

```
npm i -g yo@3.1.0 gulp@3.9.1
```

After this is installed you'll need to install the [*@microsoft/generator-sharepoint*](https://www.npmjs.com/package/@microsoft/generator-sharepoint) library

```
npm i @microsoft/generator-sharepoint@1.12.1 -g
```

After this is done you can run `npm run generate-sharepoint-webviewer-sample` and the web part will be built for you. Go into the `pdftron-webpart-sample` directory and run `gulp serve` to start a workbench with the sample WebViewer.

It is worth noting that one of the commands that is executed in `npm run generate-sharepoint-webviewer-sample` will request to install a developer
certificate for `localhost`. For more information on why this is necessary, see:

https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-development-environment#trusting-the-self-signed-developer-certificate

```bash
# Please note that it is expected for this command to take upwards of 5 minutes if running natively on Windows
# If you are running on WSL, note that it could take anywhere from 5-10 minutes
npm run generate-sharepoint-webviewer-sample
cd pdftron-webpart-sample
gulp serve
```
You should be able to add a new *PDFTronSample* web part looking like the following below.

![image](https://raw.githubusercontent.com/mike-mh/pdftron-sharepoint-web-part-sample/main/.github/images/localhost-image.png)
