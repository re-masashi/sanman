from sanic import Sanic, response
import spitfire
import requests
print("yo ")

env = spitfire.Environment('templates/')

app = Sanic(__name__)

app.static('/static', './static')


@app.get("/")
async def index(request):
    return await response.file(
    	"static/index.html"
    )

@app.get("/apisearch")
async def apisearch(request):
    return response.html(
        env.render("search_result.spf", [{
                "results": requests.get(
                    'https://saavn.me/search/songs?query='
                    +request.args['q'][0]+
                    '&page=1&limit=2'
                ).json()['data']['results']
            }], 
            template_name="search_result"
        )
    )

if __name__ == '__main__':
	app.run(host='0.0.0.0', port=1337, debug=True, auto_reload=True)