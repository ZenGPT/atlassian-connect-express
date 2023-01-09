export default function routes(app, addon) {
    // Redirect root path to /atlassian-connect.json,
    // which will be served by atlassian-connect-express.
    app.get('/', (req, res) => {
        res.redirect('/atlassian-connect.json');
    });

    // This is an example route used by "generalPages" module (see atlassian-connect.json).
    // Verify that the incoming request is authenticated with Atlassian Connect.
    app.get('/hello-world', addon.authenticate(), (req, res) => {
        // Rendering a template is easy; the render method takes two params: the name of the component or template file, and its props.
        // Handlebars and jsx are both supported, but please note that jsx changes require `npm run watch-jsx` in order to be picked up by the server.
        res.render(
          'hello-world.hbs', // change this to 'hello-world.jsx' to use the Atlaskit & React version
          {
            title: 'Atlassian Connect'
            //, issueId: req.query['issueId']
            //, browserOnly: true // you can set this to disable server-side rendering for react views
          }
        );
    });

    app.get('/register_module', async (req, res) => {
      var httpClient = addon.httpClient({
        clientKey: '3e144cfd-278b-3cac-a1eb-39792e4f0c0c'  // The unique client key of the tenant to make a request to
      });
      httpClient.post({
        uri: '/rest/atlassian-connect/1/app/module/dynamic&jwt=blah',
        json: JSON.parse(`{
          "jiraIssueFields": [
              {
                "description": {
                  "value": "HOT-98872"
                },
                "type": "single_select",
                "extractions": [
                  {
                    "path": "issue",
                    "type": "text",
                    "name": "issue"
                  }
                ],
                "name": {
                  "value": "HOT-98872"
                },
                "key": "hot-98876"
              }
            ]
        }`)
      }, function(err, res, body) {
        console.log(err);
        console.log(res);
      })
      res.send(200);
    })

    // Add additional route handlers here...
}
