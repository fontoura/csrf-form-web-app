# CSRF Form

A simple web app in node.js to test the CORS configuration of other web apps.

> ⚠️ This app is meant to be used for testing purposes only. It will allow you to perform CSRF on sites that have the wrong CORS configuration. Use it with caution!

## How to use

First and foremost, you should have [node.js](https://nodejs.org/en) installed.

Then you must install all dependencies of this app. For that purpose, issue the following command:

```
npm install
```

After this is done, you may launch the application by running:

```
npm start
```

The application runs on port `3000` by default, but you can change it in the `settings.json` file. You need to perform a server restart after changing the file.

You may create your CSRF form in the `static` folder. It will be available in the `/site` path within the running server. The application logs every value issued through the form in the `logs` folder, and then performs a POST or GET (according to the settings) to the target URL.

## License

This software has been released under the terms of the [MIT license](LICENSE.md).
