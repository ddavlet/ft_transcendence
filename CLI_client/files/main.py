import inquirer
from models import *
from pages import *
from constants import main_choices, profile_choices, url
from colorama import Fore, Back, Style, init
import asyncio

init()

async def play(user: User):
    websocket = Websocket('ws://server:8000/ws/matchmaking/', user.access_tocken)
    await websocket.connect()
    data = await websocket.recieve()
    game_id = data.get('game_id')
    url = f'ws://server:8000/ws/live_game/{game_id}/'
    websocket = Websocket(url, user.access_tocken)
    await websocket.connect()
    while True:
        data: dict = await websocket.recieve()
        if data == None:
            break
        print (data.items())
        print (data)


def profile(command, user: User):
    if command == profile_choices[0]:
        page = ProfilePages.update(user)
        answer = inquirer.prompt(page)
        user.update(answer['form'])
    elif command == profile_choices[1]:
        page = ProfilePages.update_avatar(user)
        answer = inquirer.prompt(page)
        user.upload_avatar(answer['avatar_path'])
    elif command == profile_choices[2]:
        page = ProfilePages.setup2FA(user)
        answer = inquirer.prompt(page)
        if answer['setup2FA']:
            user.setup2FA()
        else:
            print('Canceled')
            print('---------------------')
    elif command == profile_choices[3]:
        page = ProfilePages.delete(user)
        answer = inquirer.prompt(page)
        if answer['delete']:
            user.delete()
        else:
            print('Canceled')
            print('---------------------')
    elif command == profile_choices[4]:
        user.logout()
    elif command == profile_choices[5]:
        pass

async def main():
    user = User()
    answer = inquirer.prompt(Pages.main_menu(user))['Main menu']
    while True:
        if answer == main_choices[0]:
            await play(user)
        elif answer == main_choices[1]:
            page = Pages.profile(user)
            if page:
                answer = inquirer.prompt(page)['User profile']
                profile(answer, user)
        elif answer == main_choices[2]:
            page = Pages.login(user)
            if page:
                answer = inquirer.prompt(page)
                user.login(answer)
                i = 0
                while not user.auth_2fa and user.state:
                    i+=1
                    page = Pages.verify_2fa(user)
                    answer = inquirer.prompt(page)
                    user.verify(answer['token'])
                    if i > 3:
                        user.logout()
                        break

        elif answer == main_choices[3]:
            page = Pages.sign_up(user)
            if page:
                answer = inquirer.prompt(page)
                user.sign_up(answer)
        elif answer == main_choices[4]:
            Pages.exit()
        answer = inquirer.prompt(Pages.main_menu(user))['Main menu']

if __name__ == "__main__":
    asyncio.run(main())
