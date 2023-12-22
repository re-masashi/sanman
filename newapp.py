from sanic import Sanic, response
from sanic.exceptions import NotFound
import spitfire
import requests
import pprint

env = spitfire.Environment('templates')
env.compiled_templates['_1base'] = spitfire.compiler.util.load_template_file('templates/_1base.spf')

env.load_dir()

app = Sanic(__name__)

app.static('/static', './static')

@app.get("/")
async def index(request):
    return response.html(
        env.render_template('_1base', {})
    )

@app.get('/search')
async def search(request):
    return response.html(env.render_template('search', {}))

@app.get("/apisearch")
async def apisearch(request):
    q = request.args.get('q', None)
    page = request.args.get('page', None)
    queueID = request.args.get('queueID', "")

    if page is None:
        page = 1
    if q is None:
        return response.html("No results")
    bl = {"results":[]}
    res = requests.get(
        f'https://saavn.me/search/songs?query={q}&page={page}&limit=4'
    ).json().get('data')
    respl =requests.get(
        f'https://saavn.me/search/playlists?query={q}&page={page}&limit=4'
    ).json().get('data')
    resal = requests.get(
      f'https://saavn.me/search/albums?query={q}&page={page}&limit=4'
    ).json().get('data')
    if res is None:
      res = bl
    if respl is None:
      respl = bl
    if resal is None:
      resal = bl
    res = response.html(
        env.render_template("search_result", [{
                "songresults": res['results'],
                "playlistresults":  respl['results'],
                "albumresults":  resal['results'],
                "queueID": queueID
            }],
        )
    )
    res.headers['content-type'] ='text/vnd.turbo-stream.html'
    print(request.args.get('queueID'))
    return res

@app.get("/playlists/<playlistid>") # todo: Fetch from user in DB.
async def playlist_page(request, playlistid):
    # if not is_logged_in(request):
    #     return response.redirect("/login") # TODO: Flashes...
    
    data = requests.get(
        'https://saavn.me/playlists?id='+playlistid
    ).json()["data"]

    if data is None:
        return response.text("404")

    print(data)

    return response.html(
        env.render_template("playlist", [{
                "playlist": data,
            }],
        )
    )


@app.get("/albums/<albumid>") # todo: Fetch from user in DB. 
async def album_page(request, albumid):
    # if not is_logged_in(request):
    #     return response.redirect("/login") # TODO: Flashes...
    
    data = requests.get(
        'https://saavn.me/albums?id='+albumid
    ).json()["data"]

    if data is None:
        return response.text("404")

    print(data)

    return response.html(
        env.render_template("album", [{
                "album": data,
            }], 
        )
    )

@app.get("/lyrics/song/")
async def getlyrics(req,):
  q = req.args.get('q', '')
  return response.text(
    syncedlyrics.search(q)
  )

@app.exception(NotFound)
async def ignore_404s(request, exception):
    if(request.path.startswith('/api')):
        pass # todo
    res = response.html(env.render_template('_404',{}))
    return res
