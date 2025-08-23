import HERO_BANNER from '../assets/images/banner/hero_banner.png';
import ARCADE_GAME_1 from '../assets/images/library/game_1.png';
import ARCADE_GAME from '../assets/images/misc/arcade.png';
import GV_ICON from '../assets/images/icons/gv_small.png';
import DEFAULT_ARCADE_BG from '../assets/images/banner/arcade_bg.png';
import PLAYER_A_AVATAR from '../assets/images/playerA_avatar.png';
import PLAYER_B_AVATAR from '../assets/images/playerB_avatar.png';
import attack_btn_icon from '../assets/images/actionButtons/SwordsGold 1.png'
import heal_btn_icon from '../assets/images/actionButtons/ShieldGold_heal.png'
import damage_box from '../assets/images/diceShootout/damage_box.png'
import heal_box from '../assets/images/diceShootout/heal_box.png'
import degen_sweeper_flipped from '../assets/images/degenSweeper/unflipped.png'
import degen_sweeper_bomb from '../assets/images/degenSweeper/bomb.png'
import degen_sweeper_safe from '../assets/images/degenSweeper/safe.png'
import DEGEN_ARCADE_BG from '../assets/images/banner/degen_banner.png';
import star_icon from '../assets/images/icons/star.png'
import ticket_icon from '../assets/images/icons/ticket.png'
import button_frame from '../assets/images/actionButtons/button_frame.png'
import undo_icon from '../assets/images/degenSweeper/undo.png'

// Modal assets
import modal_frame from '../assets/images/modals/modal_frame.png';
import close_button from '../assets/images/modals/close_button.png';
import on_button from '../assets/images/modals/on_button.png';
import off_button from '../assets/images/modals/off_button.png';
import audio_bar from '../assets/images/modals/audio_bar.png';
import audio_controller from '../assets/images/modals/audio_controller.png';

export const IMAGES = {
    HERO_BANNER,
    ARCADE_GAME,
    ALL_ARCADES: {
        ARCADE_GAME_1,
    },
    ICONS: {
        GV_ICON,
        STAR_ICON: star_icon,
        TICKET_ICON: ticket_icon
    },
    DEFAULT_ARCADE_BG,
    DEGEN_ARCADE_BG,
    PLAYER_A_AVATAR,
    PLAYER_B_AVATAR,
    ATTACK_BTN_ICON: attack_btn_icon,
    HEAL_BTN_ICON: heal_btn_icon,
    BUTTON_FRAME: button_frame,
    UNDO_ICON: undo_icon,
    MODAL_FRAME: modal_frame,
    CLOSE_BUTTON: close_button,
    ON_BUTTON: on_button,
    OFF_BUTTON: off_button,
    AUDIO_BAR: audio_bar,
    AUDIO_CONTROLLER: audio_controller,
    DICE_SHOOTOUT: {
        DAMAGE_BOX: damage_box,
        HEAL_BOX: heal_box
    },
    DEGEN_SWEEPER: {
        FLIPPED: degen_sweeper_flipped,
        BOMB: degen_sweeper_bomb,
        SAFE: degen_sweeper_safe
    }
}