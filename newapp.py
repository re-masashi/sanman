from sanic import Sanic, response
from sanic.exceptions import NotFound
import spitfire
import requests
import pprint
import syncedlyrics


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

    return response.html(
        env.render_template("album", [{
                "album": data,
            }], 
        )
    )

@app.get("/songs/<songid>") # todo: Fetch from user in DB. 
async def song_page(request, songid):
    # if not is_logged_in(request):
    #     return response.redirect("/login") # TODO: Flashes...
    
    data = requests.get(
        'https://saavn.me/songs?id='+songid
    ).json()["data"][0]

    if data is None:
        return response.text("404")

    return response.html(
        env.render_template("song", [{
                "songname":data['name'],
                "artists": data['primaryArtists'],
                "release": data["year"],
                "image": data["image"][2]['link'],
                "album": data["album"]
            }], 
        )
    )

@app.get("/artists/<artistid>") # todo: Fetch from user in DB. 
async def artist_page(request, artistid):
    # if not is_logged_in(request):
    #     return response.redirect("/login") # TODO: Flashes...
    
    data = requests.get(
        'https://saavn.me/artists?id='+artistid
    ).json()["data"]

    if data is None:
        return response.text("404")

    return response.html(
        env.render_template("artist", [{
                "name": data["name"],
                "image": data['image'][2]['link'],
                "biodata": """
                @app.get("/artists/<artistid>") # todo: Fetch from user in DB. 
                async def artist_page(request, artistid):
                    # if not is_logged_in(request):
                    #     return response.redirect("/login") # TODO: Flashes...
                    
                    data = requests.get(
                        'https://saavn.me/artists?id='+artistid
                    ).json()["data"]

                    if data is None:
                        return response.text("404")
                """

            }], 
        )
    )

@app.get("/lyrics/")
async def getlyrics(req,songid):
    data = requests.get(
        'https://saavn.me/songs?id='+songid
    ).json()["data"][0]

    pprint.pprint(data)

    if not data:
        return response.html('404')
    
    return response.html(
        env.render_template("lyrics", {
            "lrc":syncedlyrics.search(data['name']+' '+data['primaryArtists'])
        })
    )

@app.exception(NotFound)
async def ignore_404s(request, exception):
    if(request.path.startswith('/api')):
        pass # todo
    res = response.html(env.render_template('_404',{}))
    return res
