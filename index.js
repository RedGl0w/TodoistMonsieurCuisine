const request = require('request');
const htmlparser = require('htmlparser2');
const select = require('soupselect').select
const Todoist = require('todoist').v8
const todoist = Todoist(require("./settings.json").todoist)
const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function httpsHandler(err, response, body) {
    if(err){
        console.error('error in request : ', err)
        process.exit(1);
    }
    var parser = new htmlparser.Parser(htmlHandler);
    parser.parseComplete(body);
}


var htmlHandler = new htmlparser.DefaultHandler( (error, dom) => {dom
    if (error){
        console.log('error in parsing : ', error );
        process.exit(1);
    }
    var options = extractData( dom );
});

function extractData( dom ){
    var collection = select(dom, ".recipe--ingredients-html-item .col-md-8")
    ingredients = []
    collection[0].children.forEach(element => {
        if(element.name == "ul"){
            element.children.forEach(ingredient => {
                ingredients.push(ingredient.children[0].data.trim())
            })
        }
    });
    var name = select(dom, ".recipe--content-col-content .row .recipe--header .col-md-12 .red")[0].children[0].data
    todoist.projects.add({ name: name }).then((err) => {
        const projects = todoist.projects.get()
        const receipe = projects[projects.length - 1].id;
        ingredients.forEach(ingredient => {
            todoist.items.add({
                content:ingredient,
                project_id:receipe
            })
        })
    })

    
}

rl.question("URL of the receipe : ", function(url) {
    request.get( url , httpsHandler );
    rl.close()
})
