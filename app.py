from sanic import Sanic, response, Request, Websocket
import spitfire
import requests
from tortoise.contrib.sanic import register_tortoise
from tortoise.exceptions import DoesNotExist
from models import Users, VerificationLinks
from utils import is_logged_in
import uuid
import os
import dateutil

from datetime import datetime as dt
import time, datetime
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from pprint import pprint

from dotenv import load_dotenv
load_dotenv()

configuration = sib_api_v3_sdk.Configuration()
configuration.api_key['api-key'] = os.getenv("BREVO_API_KEY")
api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))

env = spitfire.Environment('templates/')

app = Sanic(__name__)

register_tortoise(
    app, db_url="sqlite://db.sqlite3", modules={"models": ["models"]}, generate_schemas=True
)

app.static('/static', './static')


@app.get("/")
async def index(request):
    return await response.file(
    	"static/index.html"
    )

@app.get("/signup")
async def signup_get(request):
    return await response.file(
        "static/signup.html"
    )

@app.post("/signup")
async def signup_post(request):
    try:
        user = await Users.get(EMAIL=request.form["email"][0])
        print(user)
        return response.redirect("/login") # TODO: Flash 'exists'
    except DoesNotExist:
        user = await Users.create(
            NAME=request.form["name"][0], 
            EMAIL=request.form["email"][0]
        )
        await user.save()
        print(user)
        return response.redirect("/login") # TODO: Flash 'created succesfully'

@app.get("/login")
async def login_get(request):
    return await response.file(
        "static/login.html"
    )

@app.post("/login")
async def login_post(request):
    # try:
    #     link = await VerificationLinks.create(
    #         LINK=str(uuid.uuid4()),
    #         USER=request.form["email"][0],
    #         VALID_TILL=dt.now()+datetime.timedelta(hours=6),
    #     )
    #     print("\033[0;91m"+str(link)+"\033[0m")
    #     await link.save()
    #     subject = "Verification Link for Sanman"
    #     user = await Users.get(EMAIL=link.USER)
    #     html_content = f"<html><body><h1>Hi {str(user.NAME)},<a href='https://samuel.re-masashi.repl.co/login/{str(link.LINK)}'> verification link ...</a> valid for 6 hours</h1>\
    #         Your link UUID: {link.LINK} </body></html>"
    #     sender = {"name":"Nafi Amaan Hossain","email":"nafines007@gmail.com"}
    #     to = [{"email":str(link.USER)}]
    #     print(html_content)
    #     send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(to=to, html_content=html_content, sender=sender, subject=subject)
    #     try:
    #         api_response = api_instance.send_transac_email(send_smtp_email)
    #         pprint(api_response)
    #     except ApiException as e:
    #         print("Exception when calling SMTPApi->send_transac_email: %s\n" % e)
    #     return response.redirect("/")
    # except DoesNotExist:
    #     return response.redirect("/signup")
    return response.html("This feature is in Beta. Kindly contact the developer. >_<")


@app.get("/login/<id>")
async def login_id(request, id):
    # try:
    #     link = await VerificationLinks.get(
    #         LINK=id
    #     )
    #     if dt.now().timestamp() >=link.VALID_TILL.timestamp():
    #         print("[DBG] link Expired")
    #         return response.redirect("/login") # TODO: Flash 'Link expired'
    #     print("Link:", link)
    #     resp = response.redirect("/")
    #     print(resp)
    #     resp.add_cookie("userID", link.USER, secure=False)
    #     return resp
    # except DoesNotExist:# TODO: Flash error
    #     print("NO SUCH LINK")
    #     return response.redirect("/login")
    return response.html("This feature is in Beta. Kindly contact the developer.")

@app.get("/logout")
async def logout(request):
    res= response.redirect("/")
    res.delete_cookie("userID")
    return res

@app.get("/apisearch")
async def apisearch(request):
    q = request.args.get('q', None)
    if q is None:
        return response.html("No results")
    bl = {"results":[]}
    res = requests.get(
      'https://saavn.me/search/songs?query='
      +request.args['q'][0]+
      '&page=1&limit=7'
    ).json().get('data')
    respl =requests.get(
      'https://saavn.me/search/playlists?query='
      +request.args['q'][0]+
      '&page=1&limit=4'
    ).json().get('data')
    resal = requests.get(
      'https://saavn.me/search/albums?query='
      +request.args['q'][0]+
      '&page=1&limit=4'
    ).json().get('data')
    if res is None:
      res = bl
      #return response.html("No results")
    if respl is None:
      respl = bl
      #return response.html("No results")
    if resal is None:
      resal = bl
      #return response.html("No results")
    return response.html(
        env.render("search_result.spf", [{
                "songresults": res['results'],
                "playlistresults":  respl['results'],
                "albumresults":  resal['results'],
            }],
            template_name="search_result"
        )
    )

@app.get("/playlists/")
async def playlist_create(request):
    # # return response.html(
    # #     "<h1>feature will soon be available. >_<."
    # # )
    # if not is_logged_in(request):
    #     return response.redirect("/login") # TODO: Flashes...
        
    # return response.html(
    #     env.render("playlist.spf", [{
    #             "playlist": requests.get(
    #                 'https://saavn.me/search/songs?query='
    #                 'X'
    #                 '&page=1&limit=10'
    #             ).json()['data']['results']
    #         }], 
    #         template_name="search_result"
    #     )
    # )
    # if not is_logged_in(request):
    #     return response.redirect("/login") # TODO: Flashes...

    return response.html(
        "<h1>feature will soon be available. >_<."
    )

@app.get("/playlists/<playlistid>") # todo: Fetch from user in DB.
async def playlists_page(request, playlistid):
    if not is_logged_in(request):
        return response.redirect("/login") # TODO: Flashes...
    
    data = requests.get(
        'https://saavn.me/playlists?id='+playlistid
    ).json()["data"]

    if data == None:
        return response.text("404")
    return response.html(
        env.render("playlist.spf", [{
                "playlist": data['songs'],
                "cover": data["image"][0]["link"],
                "name": data["name"]
            }], 
            template_name="search_result"
        )
    )

@app.get("/history")
async def history(request,):
    if not is_logged_in(request):
        return response.redirect("/login")

    return response.html(
        "<h1>feature will soon be available. >_<.</h1>"
    )

@app.get("/favourites")
async def fav(request,):
    if not is_logged_in(request):
        return response.redirect("/login") # TODO: Flashes...

    return response.html(
        "<h1>feature will soon be available. >_<."
    )

@app.get("/share/song/")
async def sharesongs(req,):
  return await response.file(
    "static/shared.html"
  )

if __name__ == '__main__':
	app.run(host='localhost', port=1337, debug=True, auto_reload=True)
