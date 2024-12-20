import inquirer
from models import *
from pages import *
from constants import main_choices, profile_choices, url, url_game
from colorama import Fore, Back, Style, init
import asyncio
import time

init()

async def play(user: User):
    url = f'{url_game}ws/matchmaking/'
    websocket = Websocket(url, user.access_tocken)
    await websocket.connect()
    print('Connecting to matchmaking')
    await websocket.send({
        "action": "join_game",
        "token": user.access_tocken
    })
    data = await websocket.recieve()
    # print(data)
    game_id = data.get('game_id')
    url = f'{url_game}ws/online_game/{game_id}/'
    websocket = Websocket(url, user.access_tocken)
    print('Connecting to game')
    await websocket.connect()
    await websocket.send({
        "action": "authenticate",
        "token": user.access_tocken
    })
    await websocket.send({"action": "get_init_data"})
    game: Game = {}
    print('Waiting for data')
    while True:
        data: dict = await websocket.recieve()
        if data and data.get('game_data'):
            game = Game(data.get('game_data'), websocket)
            break
        await websocket.send({"action": "get_init_data"})
    game.start()
    game.check_window()
    await websocket.send({
        "action": "authenticate",
        "token": user.access_tocken
    })
    await websocket.send({
        "action": "player_ready"
    })
    # while True:
    #     data: dict = await websocket.recieve()
    #     print(data)
    #     time.sleep(3)
    curr_time = time.time()
    game._stdscr.refresh()
    while True:
        game._stdscr.clear()
        data: dict = await websocket.recieve()
        if data == None:
            break
        data = data.get('game_state', None)
        # if data and data['countdown'] != 0:
        #     print(f'Game will start in {int(data.get("countdown"))}')
        # if data and time.time() - curr_time > 1:
        #     # game.draw_vert_paddle(data.get('player2_pos'), data.get('player2_pos') + game._paddle_size, 1)
        #     curr_time = time.time()
        if data:
            game.draw_ball(dict(data.get('ball')))
            game.draw_vert_paddle(int(data.get('player1_pos') / game.ratio), int(data.get('player1_pos') / game.ratio) + game._paddle_size, 0)
            game.draw_vert_paddle(int(data.get('player2_pos') / game.ratio), int(data.get('player2_pos') / game.ratio) + game._paddle_size, 1)
            game._stdscr.refresh()
            # print(data.get('ball'))

        key = game._stdscr.getch()
        # await game.move_paddle(key)
        if key == ord('w'):
            await websocket.send({
                "action": "move_player",
                "direction": 1
            })
            key = None
        elif key == ord('s'):
            await websocket.send({
                "action": "move_player",
                "direction": -1
            })
            key = None
        # time.sleep(0.01)




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
