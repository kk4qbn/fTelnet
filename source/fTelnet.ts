/*
  fTelnet: An HTML5 WebSocket client
  Copyright (C) 2009-2013  Rick Parrish, R&M Software

  This file is part of fTelnet.

  fTelnet is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as
  published by the Free Software Foundation, either version 3 of the
  License, or any later version.

  fTelnet is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Affero General Public License for more details.

  You should have received a copy of the GNU Affero General Public License
  along with fTelnet.  If not, see <http://www.gnu.org/licenses/>.
*/
/// <reference path="3rdparty/DetectMobileBrowser.ts" />
/// <reference path="randm/ansi/Ansi.ts" />
/// <reference path="randm/tcp/rlogin/RLoginConnection.ts" />
/// <reference path="randm/graph/rip/RIP.ts" />
class fTelnet {
    // Events
    public static ondata: IMessageEvent = new TypedEvent();

    // Private variables
    private static _ClientContainer: HTMLDivElement = null;
    private static _Connection: WebSocketConnection = null;
    private static _DataTimer: number = null;
    private static _FocusWarningBar: HTMLDivElement = null;
    private static _fTelnetContainer: HTMLElement = null;
    private static _HasFocus: boolean = true;
    private static _InitMessageBar: HTMLDivElement = null;
    private static _LastTimer: number = 0;
    private static _MenuButton: HTMLAnchorElement = null;
    private static _MenuButtons: HTMLDivElement = null;
    private static _ScrollbackBar: HTMLDivElement = null;
    private static _StatusBar: HTMLDivElement = null;
    private static _StatusBarLabel: HTMLSpanElement = null;
    private static _Timer: number = null;
    private static _YModemReceive: YModemReceive = null;
    private static _YModemSend: YModemSend = null;

    // Settings to be loaded from HTML
    private static _BareLFtoCRLF: boolean = false;
    private static _BitsPerSecond: number = 57600;
    private static _Blink: boolean = true;
    private static _ConnectionType: string = 'telnet';
    private static _Emulation: string = 'ansi-bbs';
    private static _Enter: string = '\r';
    private static _Font: string = 'CP437';
    private static _ForceWss: boolean = false;
    private static _Hostname: string = 'bbs.ftelnet.ca';
    private static _LocalEcho: boolean = false;
    private static _Port: number = 1123;
    private static _ProxyHostname: string = '';
    private static _ProxyPort: number = 1123;
    private static _ProxyPortSecure: number = 11235;
    private static _RLoginClientUsername: string = '';
    private static _RLoginServerUsername: string = '';
    private static _RLoginTerminalType: string = '';
    private static _ScreenColumns: number = 80;
    private static _ScreenRows: number = 25;
    private static _SplashScreen: string = 'G1swbRtbMkobWzA7MEgbWzE7NDQ7MzRt2sTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEG1swOzQ0OzMwbb8bWzBtDQobWzE7NDQ7MzRtsyAgG1szN21XZWxjb21lISAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAbWzA7NDQ7MzBtsxtbMG0NChtbMTs0NDszNG3AG1swOzQ0OzMwbcTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTE2RtbMG0NCg0KG1sxbSAbWzBtIBtbMTs0NDszNG3axMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMQbWzA7NDQ7MzBtvxtbMG0NCiAgG1sxOzQ0OzM0bbMbWzA7MzRt29vb2xtbMzBt29vb29vb29vb29vb29vb29vb29vb2xtbMzRt29vb29vbG1s0NDszMG2zG1swbQ0KICAbWzE7NDQ7MzRtsxtbMDszNG3b29vbG1sxOzMwbdvb29vb29vb29vb29vb29vb29vb29sbWzA7MzBt29sbWzM0bdvb29sbWzQ0OzMwbbMbWzBtDQogIBtbMTs0NDszNG2zG1swOzM0bdvb29sbWzE7MzBt29vb2xtbMG3b29vb29vb29vb29sbWzFt29vb2xtbMzBt29sbWzA7MzBt29sbWzM0bdvb29sbWzQ0OzMwbbMbWzBtDQogIBtbMTs0NDszNG2zG1swOzM0bdvb29sbWzE7MzBt29vb2xtbMG3b29vb29vb29vbG1sxbdvb29sbWzBt29sbWzE7MzBt29sbWzA7MzBt29sbWzM0bdvb29sbWzQ0OzMwbbMbWzBtDQogIBtbMTs0NDszNG2zG1swOzM0bdvb29sbWzE7MzBt29vb2xtbMG3b29vb29vb2xtbMW3b29vbG1swbdvbG1sxbdvbG1szMG3b2xtbMDszMG3b2xtbMzRt29vb2xtbNDQ7MzBtsxtbMG0NCiAgG1sxOzQ0OzM0bbMbWzA7MzRt29vb2xtbMTszMG3b29vbG1swbdvb29vb2xtbMW3b29vbG1swbdvbG1sxbdvb29sbWzMwbdvbG1swOzMwbdvbG1szNG3b29vbG1s0NDszMG2zG1swbQ0KICAbWzE7NDQ7MzRtsxtbMDszNG3b29vbG1sxOzMwbdvb29sbWzBt29vb2xtbMW3b29vbG1swbdvbG1sxbdvb29vb2xtbMzBt29sbWzA7MzBt29sbWzM0bdvb29sbWzQ0OzMwbbMbWzQwOzM3bQ0KICAbWzE7NDQ7MzRtsxtbMDszNG3b29vbG1sxOzMwbdvbG1swOzMwbdvbG1sxbdvb29vb29vb29vb29vb29vb2xtbMDszMG3b2xtbMzRt29vb2xtbNDQ7MzBtsxtbNDA7MzdtDQogIBtbMTs0NDszNG2zG1swOzM0bdvb29sbWzE7MzBt29sbWzBt29vb29vb29vb29vb29vb29vb29sbWzMwbdvbG1szNG3b29vbG1s0NDszMG2zG1s0MDszN20NCiAgG1sxOzQ0OzM0bbMbWzA7MzBt29vb29vb29vb29vb29vb29vb29vb29vb29vb29vbG1szNG3b2xtbNDQ7MzBtsxtbNDA7MzdtDQogIBtbMTs0NDszNG2zG1s0MDszMG3b2xtbMG3b29vb29vb29vb29vb29vb29vb29vb29vb29vbG1szMG3b2xtbNDRtsxtbNDA7MzdtIBtbMzRtIBtbMTs0NzszN23axMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMQbWzMwbb8bWzBtDQogIBtbMTs0NDszNG2zG1swOzMwbdvbG1sxbdvb29vb29vb29vb29vb29sbWzA7MzBt29vb29vb29vb2xtbMW3b2xtbMDszMG3b2xtbNDRtsxtbNDA7MzdtIBtbMzRtIBtbMTs0NzszN22zICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAbWzMwbbMbWzBtDQogIBtbMTs0NDszNG2zG1s0MDszMG3b2xtbMG3b29vb29vb29vb29vb29vb29vb29vb29vb29vbG1szMG3b2xtbNDRtsxtbMG0gG1szNG0gG1sxOzQ3OzM3bbMgICAbWzM0bUh0bWxUZXJtIC0tIFRlbG5ldCBmb3IgdGhlIFdlYiAgICAgG1szMG2zG1swbQ0KG1sxbSAbWzBtIBtbMTs0NDszNG2zG1swOzMwbdvbG1sxbdvb29vb29vb29vb29vb29vb29vb29vb2xtbMDszMG3b29vb29sbWzQ0bbMbWzBtIBtbMzRtIBtbMTs0NzszN22zICAgICAbWzA7NDc7MzRtV2ViIGJhc2VkIEJCUyB0ZXJtaW5hbCBjbGllbnQgICAgG1sxOzMwbbMbWzBtDQogIBtbMTs0NDszNG2zG1swOzM0bdvbG1szMG3b29vb29vb29vb29vb29vb29vb29vb29vb29vbG1szNG3b2xtbNDQ7MzBtsxtbMG0gG1szNG0gG1sxOzQ3OzM3bbMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIBtbMzBtsxtbMG0NCiAgG1sxOzQ0OzM0bcAbWzA7NDQ7MzBtxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTZG1swbSAbWzM0bSAbWzE7NDc7MzdtwBtbMzBtxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTZG1swbQ0KDQobWzExQxtbMTszMm1Db3B5cmlnaHQgKEMpIDIwMDAtMjAxNCBSJk0gU29mdHdhcmUuICBBbGwgUmlnaHRzIFJlc2VydmVkDQobWzA7MzRtxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExA==';
    private static _StatusBarVisible: boolean = true;
    private static _VirtualKeyboardVisible: boolean = DetectMobileBrowser.IsMobile;

    public static Init(): boolean {
        // Ensure we have our container
        if (document.getElementById('fTelnetContainer') === null) {
            alert('fTelnet Error: Container element with id="fTelnetContainer" was not found');
            return false;
        }
        this._fTelnetContainer = document.getElementById('fTelnetContainer');

        // Ensure the script tag includes the id we want
        if (document.getElementById('fTelnetScript') === null) {
            alert('fTelnet Error: Script element with id="fTelnetScript" was not found');
            return false;
        }

        // Ensure we have tags for the client and keyboard css
        if (document.getElementById('fTelnetCss') === null) {
            var link = document.createElement('link');
            link.id = 'fTelnetCss';
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = StringUtils.GetUrl('ftelnet.css');
            document.getElementsByTagName('head')[0].appendChild(link);
        }
        if (document.getElementById('fTelnetKeyboardCss') === null) {
            var link = document.createElement('link');
            link.id = 'fTelnetKeyboardCss';
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = '';
            document.getElementsByTagName('head')[0].appendChild(link);
        }

        // Add init message
        this._InitMessageBar = document.createElement('div');
        this._InitMessageBar.id = 'fTelnetInitMessage';
        this._InitMessageBar.innerHTML = 'Initializing fTelnet...';
        this._fTelnetContainer.appendChild(this._InitMessageBar);

        // IE less than 9.0 will throw script errors and not even load
        if (navigator.appName === 'Microsoft Internet Explorer') {
            var Version: number = -1;
            var RE: RegExp = new RegExp('MSIE ([0-9]{1,}[\\.0-9]{0,})');
            if (RE.exec(navigator.userAgent) !== null) { Version = parseFloat(RegExp.$1); }
            if (Version < 9.0) {
                var IELessThan9Message = 'fTelnet Error: Internet Explorer < 9 is not supported.\n\nPlease upgrade to IE 9 or newer, or better still would be to use Firefox or Chrome instead of IE.';
                this._InitMessageBar.innerHTML = IELessThan9Message;
                alert(IELessThan9Message);
                return false;
            }
        }

        // Create the client container (crt/graph)
        this._ClientContainer = document.createElement('div');
        this._ClientContainer.id = 'fTelnetClientContainer';
        this._fTelnetContainer.appendChild(this._ClientContainer);

        // Setup the client container for modern scrollback on desktop devices
        if (DetectMobileBrowser.SupportsModernScrollback) {
            this._ClientContainer.style.overflowX = 'hidden';
            this._ClientContainer.style.overflowY = 'scroll';
            this._ClientContainer.style.height = this._ScreenRows * 16 + 'px'; // Default font is 9x16
            this._ClientContainer.style.width = (this._ScreenColumns * 9) + GetScrollbarWidth.Width + 'px'; // Default font is 9x16
            this._ClientContainer.scrollTop = this._ClientContainer.scrollHeight;
        }

        // Seup the crt window
        if (Crt.Init(this._ClientContainer) && ((this._Emulation !== 'RIP') || Graph.Init(this._ClientContainer))) {
            this._InitMessageBar.style.display = 'none';

            Crt.onfontchange.on((): void => { this.OnCrtScreenSizeChanged(); });
            Crt.onkeypressed.on((): void => { this.OnCrtKeyPressed(); });
            Crt.onscreensizechange.on((): void => { this.OnCrtScreenSizeChanged(); });
            Crt.BareLFtoCRLF = this._BareLFtoCRLF;
            Crt.Blink = this._Blink;
            Crt.LocalEcho = this._LocalEcho;
            Crt.SetFont(this._Font);
            Crt.SetScreenSize(this._ScreenColumns, this._ScreenRows);

            // Test websocket support
            if (!('WebSocket' in window) || navigator.userAgent.match('AppleWebKit/534.30')) {
                Crt.WriteLn();
                Crt.WriteLn('Sorry, but your browser doesn\'t support the WebSocket protocol!');
                Crt.WriteLn();
                Crt.WriteLn('WebSockets are how fTelnet connects to the remote server, so without them that');
                Crt.WriteLn('means you won\'t be able to connect anywhere.');
                Crt.WriteLn();
                Crt.WriteLn('If you can, try upgrading your web browser.  If that\'s not an option (ie you\'re');
                Crt.WriteLn('already running the latest version your platform supports, like IE 8 on');
                Crt.WriteLn('Windows XP), then try switching to a different web browser.');
                Crt.WriteLn();
                Crt.WriteLn('Feel free to contact me (http://www.ftelnet.ca/contact/) if you think you\'re');
                Crt.WriteLn('seeing this message in error, and I\'ll look into it.  Be sure to let me know');
                Crt.WriteLn('what browser you use, as well as which version it is.');
                console.log('fTelnet Error: WebSocket not supported');
                return false;
            }

            // Create the focus bar
            this._FocusWarningBar = document.createElement('div');
            this._FocusWarningBar.id = 'fTelnetFocusWarning';
            this._FocusWarningBar.innerHTML = '*** CLICK HERE TO ENABLE KEYBOARD INPUT ***';
            this._FocusWarningBar.style.display = 'none';
            this._fTelnetContainer.appendChild(this._FocusWarningBar);

            // Create the scrollback bar
                this._ScrollbackBar = document.createElement('div');
                this._ScrollbackBar.id = 'fTelnetScrollback';
                if (!DetectMobileBrowser.SupportsModernScrollback) {
                    this._ScrollbackBar.innerHTML = 'SCROLLBACK: <a href="#" onclick="Crt.PushKeyDown(Keyboard.UP, Keyboard.UP, false, false, false); return false;">Line Up</a> | ' +
                    '<a href="#" onclick="Crt.PushKeyDown(Keyboard.DOWN, Keyboard.DOWN, false, false, false); return false;">Line Down</a> | ' +
                    '<a href="#" onclick="Crt.PushKeyDown(Keyboard.PAGE_UP, Keyboard.PAGE_UP, false, false, false); return false;">Page Up</a> | ' +
                    '<a href="#" onclick="Crt.PushKeyDown(Keyboard.PAGE_DOWN, Keyboard.PAGE_DOWN, false, false, false); return false;">Page Down</a> | ' +
                    '<a href="#" onclick="fTelnet.ExitScrollback(); return false;">Exit</a>';
                } else {
                    this._ScrollbackBar.innerHTML = 'SCROLLBACK: Scroll back down to the bottom to exit scrollback mode';
                }
                this._ScrollbackBar.style.display = 'none';
                this._fTelnetContainer.appendChild(this._ScrollbackBar);
                // TODO Also have a span to hold the current line number
            
            // Create the status bar
            this._StatusBar = document.createElement('div');
            this._StatusBar.id = 'fTelnetStatusBar';
            this._StatusBar.style.display = (this._StatusBarVisible ? 'block' : 'none');
            this._fTelnetContainer.appendChild(this._StatusBar);

            // Create the statusbar menu button
            this._MenuButton = document.createElement('a');
            this._MenuButton.id = 'fTelnetMenuButton';
            this._MenuButton.href = '#';
            this._MenuButton.innerHTML = 'Menu';
            this._MenuButton.addEventListener('click', (e: Event): boolean => { return this.OnMenuButtonClick(e); }, false);
            this._StatusBar.appendChild(this._MenuButton);

            // Create the statusbar label
            this._StatusBarLabel = document.createElement('span');
            this._StatusBarLabel.id = 'fTelnetStatusBarLabel';
            this._StatusBarLabel.innerHTML = '<a href="#" onclick="fTelnet.Connect(); return false;">Connect</a> Not connected';
            this._StatusBar.appendChild(this._StatusBarLabel);

            // Create the menu buttons
            this._MenuButtons = document.createElement('div');
            this._MenuButtons.id = 'fTelnetMenuButtons';
            this._MenuButtons.innerHTML = '<table cellpadding="5" cellspacing="1"><tr><td><a href="#" onclick="fTelnet.Connect(); return false;">Connect</a></td>'
                + '<td><a href="#" onclick="fTelnet.Disconnect(true); return false;">Disconnect</a></td></tr>'
                + (DetectMobileBrowser.IsMobile ? '' : '<tr><td><a href="#" onclick="fTelnet.ClipboardCopy(); return false;">Copy</a></td>')
                + (DetectMobileBrowser.IsMobile ? '' : '<td><a href="#" onclick="fTelnet.ClipboardPaste(); return false;">Paste</a></td></tr>')
                + '<tr><td><a href="#" onclick="fTelnet.Upload(); return false;">Upload</a></td>'
                + '<td><a href="#" onclick="fTelnet.Download(); return false;">Download</a></td></tr>'
                + '<tr><td><a href="#" onclick="fTelnet.VirtualKeyboardVisible = !fTelnet.VirtualKeyboardVisible; return false;">Keyboard</a></td>'
                + '<td><a href="#" onclick="fTelnet.FullScreenToggle(); return false;">Full&nbsp;Screen</a></td></tr>'
            + (!DetectMobileBrowser.SupportsModernScrollback ? '<tr><td colspan="2"><a href="#" onclick="fTelnet.EnterScrollback(); return false;">View Scrollback Buffer</a></td></tr>' : '');
            this._MenuButtons.style.display = 'none';
            this._MenuButtons.style.zIndex = '150';  // TODO Maybe a constant from another file to help keep zindexes correct for different elements?
            this._fTelnetContainer.appendChild(this._MenuButtons);

            // Create the virtual keyboard
            VirtualKeyboard.Init(this._fTelnetContainer);
            VirtualKeyboard.Visible = this._VirtualKeyboardVisible;

            // Size the scrollback and button divs
            this.OnCrtScreenSizeChanged();

            // Create the ansi cursor position handler
            Ansi.onesc0c.on((): void => { this.OnAnsiESC0c(); });
            Ansi.onesc5n.on((): void => { this.OnAnsiESC5n(); });
            Ansi.onesc6n.on((): void => { this.OnAnsiESC6n(); });
            Ansi.onesc255n.on((): void => { this.OnAnsiESC255n(); });
            Ansi.onescQ.on((font: string): void => { this.OnAnsiESCQ(font); });
            Ansi.onripdetect.on((): void => { this.OnAnsiRIPDetect(); });
            Ansi.onripdisable.on((): void => { this.OnAnsiRIPDisable(); });
            Ansi.onripenable.on((): void => { this.OnAnsiRIPEnable(); });

            if (this._Emulation === 'RIP') {
                RIP.Parse(atob(this._SplashScreen));
            } else {
                Ansi.Write(atob(this._SplashScreen));
            }
        } else {
            this._InitMessageBar.innerHTML = 'fTelnet Error: Unable to init Crt class';
            if (this._ScrollbackBar !== null) this._ScrollbackBar.style.display = 'none';
            this._FocusWarningBar.style.display = 'none';
            return false;
        }

        // Create our main timer
        this._Timer = setInterval((): void => { this.OnTimer(); }, 250);

        // Add our upload control
        var fTelnetUpload: HTMLInputElement = <HTMLInputElement>document.createElement('input');
        fTelnetUpload.type = 'file';
        fTelnetUpload.id = 'fTelnetUpload';
        fTelnetUpload.onchange = (): void => { this.OnUploadFileSelected(); };
        fTelnetUpload.style.display = 'none';
        this._fTelnetContainer.appendChild(fTelnetUpload);

        return true;
    }

    public static get BareLFtoCRLF(): boolean {
        return this._BareLFtoCRLF;
    }

    public static set BareLFtoCRLF(value: boolean) {
        this._BareLFtoCRLF = value;
        Crt.BareLFtoCRLF = value;
    }

    public static get BitsPerSecond(): number {
        return this._BitsPerSecond;
    }

    public static set BitsPerSecond(value: number) {
        this._BitsPerSecond = value;
    }

    public static get Blink(): boolean {
        return this._Blink;
    }

    public static set Blink(value: boolean) {
        this._Blink = value;
    }

    public static get ButtonBarVisible(): boolean {
        // No longer used -- only here to avoid errors for people who used this
        return true;
    }

    public static set ButtonBarVisible(value: boolean) {
        // No longer used -- only here to avoid errors for people who used this
    }

    public static ClipboardCopy(): void {
        // Hide the menu buttons (in case we clicked the Connect menu button)
        if (this._MenuButtons !== null) this._MenuButtons.style.display = 'none';

        alert('Click and drag your mouse over the text you want to copy');
    }

    public static ClipboardPaste(): void {
        // Hide the menu buttons (in case we clicked the Connect menu button)
        if (this._MenuButtons !== null) this._MenuButtons.style.display = 'none';

        if (this._Connection === null) { return; }
        if (!this._Connection.connected) { return; }

        var Text = Clipboard.GetData();
        for (var i = 0; i < Text.length; i++) {
            var B: number = Text.charCodeAt(i);
            if ((B == 13) || (B == 32)) {
                // Handle CR and space differently
                Crt.PushKeyDown(0, B, false, false, false);
            } else if ((B >= 33) && (B <= 126)) {
                // Handle normal key
                Crt.PushKeyPress(B, 0, false, false, false);
            }
        }
    }

    public static get ConnectionType(): string {
        return this._ConnectionType;
    }

    public static set ConnectionType(value: string) {
        this._ConnectionType = value;
    }

    public static Connect(): void {
        // Hide the menu buttons (in case we clicked the Connect menu button)
        if (this._MenuButtons !== null) this._MenuButtons.style.display = 'none';

        if ((this._Connection !== null) && (this._Connection.connected)) { return; }

        // Create new connection
        switch (this._ConnectionType) {
            case 'rlogin':
                this._Connection = new RLoginConnection();
                break;
            case 'tcp':
                this._Connection = new WebSocketConnection();
                break;
            default:
                this._Connection = new TelnetConnection();
                this._Connection.LocalEcho = this._LocalEcho;
                this._Connection.onlocalecho.on((value: boolean): void => { this.OnConnectionLocalEcho(value); });
                break;
        }

        this._Connection.onclose.on((): void => { this.OnConnectionClose(); });
        this._Connection.onconnect.on((): void => { this.OnConnectionConnect(); });
        this._Connection.ondata.on((): void => { this.OnConnectionData(); });
        this._Connection.onioerror.on((): void => { this.OnConnectionIOError(); });
        this._Connection.onsecurityerror.on((): void => { this.OnConnectionSecurityError(); });

        // Reset display
        if (this._Emulation === 'RIP') {
            RIP.ResetWindows();
        } else {
            Crt.NormVideo();
            Crt.ClrScr();
        }

        // Make connection
        if (this._ProxyHostname === '') {
            this._StatusBarLabel.innerHTML = 'Connecting to ' + this._Hostname + ':' + this._Port;
            this._StatusBar.style.backgroundColor = 'blue';
            this._ClientContainer.style.opacity = '1.0';
            this._Connection.connect(this._Hostname, this._Port, this._ForceWss);
        } else {
            this._StatusBarLabel.innerHTML = 'Connecting to ' + this._Hostname + ':' + this._Port + ' via ' + this._ProxyHostname;
            this._StatusBar.style.backgroundColor = 'blue';
            this._ClientContainer.style.opacity = '1.0';
            this._Connection.connect(this._Hostname, this._Port, this._ForceWss, this._ProxyHostname, this._ProxyPort, this._ProxyPortSecure);
        }
    }

    public static get Connected(): boolean {
        if (this._Connection === null) { return false; }
        return this._Connection.connected;
    }

    public static Disconnect(prompt: boolean): boolean {
        // Hide the menu buttons (in case we clicked the Connect menu button)
        if (this._MenuButtons !== null) this._MenuButtons.style.display = 'none';

        if (this._Connection === null) { return true; }
        if (!this._Connection.connected) { return true; }

        if (!prompt || confirm('Are you sure you want to disconnect?')) {
            this._Connection.onclose.off();
            this._Connection.onconnect.off();
            this._Connection.ondata.off();
            this._Connection.onioerror.off();
            this._Connection.onlocalecho.off();
            this._Connection.onsecurityerror.off();
            this._Connection.close();
            this._Connection = null;

            this.OnConnectionClose();
            return true;
        }

        return false;
    }

    public static Download(): void {
        // Hide the menu buttons (in case we clicked the Connect menu button)
        if (this._MenuButtons !== null) this._MenuButtons.style.display = 'none';

        if (this._Connection === null) { return; }
        if (!this._Connection.connected) { return; }

        // Transfer the file
        this._YModemReceive = new YModemReceive(this._Connection);

        // Setup listeners for during transfer
        clearInterval(this._Timer);
        this._Timer = null;
        this._YModemReceive.ontransfercomplete.on((): void => { this.OnDownloadComplete(); });

        // Download the file
        this._YModemReceive.Download();
    }

    public static get Emulation(): string {
        return this._Emulation;
    }

    public static set Emulation(value: string) {
        switch (value) {
            case 'RIP':
                this._Emulation = 'RIP';
                this._Font = 'RIP_8x8';
                this._ScreenRows = 43;
                break;
            default:
                this._Emulation = 'ansi-bbs';
                break;
        }
    }

    public static get Enter(): string {
        return this._Enter;
    }

    public static set Enter(value: string) {
        this._Enter = value;
    }

    public static EnterScrollback(): void {
        // Hide the menu buttons (in case we clicked the Connect menu button)
        if (this._MenuButtons !== null) this._MenuButtons.style.display = 'none';

        if (this._ScrollbackBar !== null) {
            if (this._ScrollbackBar.style.display = 'none') {
                Crt.EnterScrollback();
                this._ScrollbackBar.style.display = 'block';
            }
        }
    }

    public static ExitScrollback(): void {
        if (this._ScrollbackBar !== null) {
            if (this._ScrollbackBar.style.display = 'block') {
                Crt.ExitScrollback();
                this._ScrollbackBar.style.display = 'none';
            }
        }
    }

    public static get Font(): string {
        return this._Font;
    }

    public static set Font(value: string) {
        this._Font = value;
    }

    public static get ForceWss(): boolean {
        return this._ForceWss;
    }

    public static set ForceWss(value: boolean) {
        this._ForceWss = value;
    }

    public static FullScreenToggle(): void {
        // Hide the menu buttons (in case we clicked the Connect menu button)
        if (this._MenuButtons !== null) this._MenuButtons.style.display = 'none';

        if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
            if (this._fTelnetContainer.requestFullscreen) {
                this._fTelnetContainer.requestFullscreen();
            } else if (this._fTelnetContainer.msRequestFullscreen) {
                this._fTelnetContainer.msRequestFullscreen();
            } else if (this._fTelnetContainer.mozRequestFullScreen) {
                this._fTelnetContainer.mozRequestFullScreen();
            } else if (this._fTelnetContainer.webkitRequestFullscreen) {
                //Make TypeScript 1.5.4 happy this._fTelnetContainer.webkitRequestFullscreen((<any>Element).ALLOW_KEYBOARD_INPUT);
                this._fTelnetContainer.webkitRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    }

    public static get Hostname(): string {
        return this._Hostname;
    }

    public static set Hostname(value: string) {
        this._Hostname = value;
    }

    public static get LocalEcho(): boolean {
        return this._LocalEcho;
    }

    public static set LocalEcho(value: boolean) {
        this._LocalEcho = value;

        Crt.LocalEcho = value;
        if ((this._Connection !== null) && (this._Connection.connected)) {
            this._Connection.LocalEcho = value;
        }
    }

    private static OnAnsiESC0c(): void {
        // Respond with 'ftelnet'
        this._Connection.writeSTring('\x1B[102;116;101;108;110;101;116c');
    }

    private static OnAnsiESC5n(): void {
        this._Connection.writeString('\x1B[0n');
    }

    private static OnAnsiESC6n(): void {
        this._Connection.writeString(Ansi.CursorPosition());
    }

    private static OnAnsiESC255n(): void {
        this._Connection.writeString(Ansi.CursorPosition(Crt.WindCols, Crt.WindRows));
    }

    private static OnAnsiESCQ(font: string): void {
        Crt.SetFont(font);
    }

    private static OnAnsiRIPDetect(): void {
        if (this._Emulation === 'RIP') {
            this._Connection.writeString('RIPSCRIP015400');
        }
    }

    private static OnAnsiRIPDisable(): void {
        // TODO RIP.DisableParsing();
    }

    private static OnAnsiRIPEnable(): void {
        // TODO RIP.EnableParsing();
    }

    private static OnConnectionClose(): void {
        this._StatusBarLabel.innerHTML = '<a href="#" onclick="fTelnet.Connect(); return false;">Reconnect</a> Disconnected from ' + this._Hostname + ':' + this._Port;
        this._StatusBar.style.backgroundColor = 'red';
        this._ClientContainer.style.opacity = '0.5';
    }

    private static OnConnectionConnect(): void {
        Crt.ClrScr();

        if (this._ProxyHostname === '') {
            this._StatusBarLabel.innerHTML = 'Connected to ' + this._Hostname + ':' + this._Port;
            this._StatusBar.style.backgroundColor = 'blue';
            this._ClientContainer.style.opacity = '1.0';
        } else {
            this._StatusBarLabel.innerHTML = 'Connected to ' + this._Hostname + ':' + this._Port + ' via ' + this._ProxyHostname;
            this._StatusBar.style.backgroundColor = 'blue';
            this._ClientContainer.style.opacity = '1.0';
        }

        if (this._ConnectionType === 'rlogin') {
            var TerminalType: string = this._RLoginTerminalType;
            if (TerminalType === '') {
                TerminalType = this._Emulation + '/' + this._BitsPerSecond;
            }
            this._Connection.writeString(String.fromCharCode(0) + this._RLoginClientUsername + String.fromCharCode(0) + this._RLoginServerUsername + String.fromCharCode(0) + TerminalType + String.fromCharCode(0));
            this._Connection.flush();
        }

        // TODO If telnet, old fTelnet used to send will sga, wont linemode, and will/wont echo based on localecho
    }

    private static OnConnectionData(): void {
        // If the timer is disabled then we're transferring data and don't want to process it here
        if (this._Timer !== null) {
            if (this._Connection !== null) {
                // Determine how long it took between frames
                var MSecElapsed: number = new Date().getTime() - this._LastTimer;
                if (MSecElapsed < 1) { MSecElapsed = 1; }

                // Determine how many bytes we need to read to achieve the requested BitsPerSecond rate
                var BytesToRead: number = Math.floor(this._BitsPerSecond / 8 / (1000 / MSecElapsed));
                if (BytesToRead < 1) { BytesToRead = 1; }

                // Read the number of bytes we want
                var Data: string = this._Connection.readString(BytesToRead);
                if (Data.length > 0) {
                    this.ondata.trigger(Data);
                    if (this._Emulation === 'RIP') {
                        RIP.Parse(Data);
                    } else {
                        Ansi.Write(Data);
                    }
                }

                // If we have data leftover, schedule a new timer
                if (this._Connection.bytesAvailable > 0) {
                    // Restart timer to handle the end of the screen
                    clearTimeout(this._DataTimer);
                    this._DataTimer = setTimeout((): void => { this.OnConnectionData(); }, 50);
                }
            }
        }
        this._LastTimer = new Date().getTime();
    }

    private static OnConnectionLocalEcho(value: boolean): void {
        this._LocalEcho = value;
        Crt.LocalEcho = value;
    }

    private static OnConnectionIOError(): void {
        console.log('fTelnet.OnConnectionIOError');
    }

    private static OnConnectionSecurityError(): void {
        if (this._ProxyHostname === '') {
            this._StatusBarLabel.innerHTML = '<a href="#" onclick="fTelnet.Connect(); return false;">Retry Connection</a> Unable to connect to ' + this._Hostname + ':' + this._Port;
            this._StatusBar.style.backgroundColor = 'red';
            this._ClientContainer.style.opacity = '0.5';
        } else {
            this._StatusBarLabel.innerHTML = '<a href="#" onclick="fTelnet.Connect(); return false;">Retry Connection</a> Unable to connect to ' + this._Hostname + ':' + this._Port + ' via ' + this._ProxyHostname;
            this._StatusBar.style.backgroundColor = 'red';
            this._ClientContainer.style.opacity = '0.5';
        }
    }

    private static OnCrtKeyPressed(): void {
        // If the timer is active, then handle the keypress (if it's not active then we're uploading/downloading and don't want to interrupt its handling of keypresses)
        // TODO Maybe we should handle the CTRL-X to abort here instead of in the ymodem classes
        if (this._Timer !== null) {
            while (Crt.KeyPressed()) {
                var KPE: KeyPressEvent = Crt.ReadKey();

                if (KPE !== null) {
                    if (KPE.keyString.length > 0) {
                        if ((this._Connection !== null) && (this._Connection.connected)) {
                            // Handle translating Enter key
                            if (KPE.keyString === '\r\n') {
                                this._Connection.writeString(this._Enter);
                            } else {
                                this._Connection.writeString(KPE.keyString);
                            }
                        }
                    }
                }
            }
        }

    }

    private static OnCrtScreenSizeChanged(): void {
        if (!DetectMobileBrowser.SupportsModernScrollback) {
            var NewWidth: number = Crt.ScreenCols * Crt.Font.Width;
        } else {
            // Non-mobile means modern scrollback, which needs both width and height to be set
            var NewWidth: number = Crt.ScreenCols * Crt.Font.Width + GetScrollbarWidth.Width;
            var NewHeight: number = Crt.ScreenRows * Crt.Font.Height;

            this._ClientContainer.style.width = NewWidth + 'px';
            this._ClientContainer.style.height = NewHeight + 'px';
            this._ClientContainer.scrollTop = this._ClientContainer.scrollHeight;
        }

        // TODO -10 is 5px of left and right padding -- would be good if this wasn't hardcoded since it can be customized in the .css
        if (this._FocusWarningBar != null) { this._FocusWarningBar.style.width = NewWidth - 10 + 'px'; }
        if (this._ScrollbackBar != null) { this._ScrollbackBar.style.width = NewWidth - 10 + 'px'; }
        if (this._StatusBar != null) { this._StatusBar.style.width = NewWidth - 10 + 'px'; }

        // Pick virtual keyboard width
        if ((document.getElementById('fTelnetScript') !== null) && (document.getElementById('fTelnetKeyboardCss') != null)) {
            var KeyboardSizes: number[] = [960, 800, 720, 640, 560, 480];
            for (var i: number = 0; i < KeyboardSizes.length; i++) {
                if ((NewWidth >= KeyboardSizes[i]) || (i === (KeyboardSizes.length - 1))) {
                    (<HTMLLinkElement>document.getElementById('fTelnetKeyboardCss')).href = StringUtils.GetUrl('keyboard/keyboard-' + KeyboardSizes[i].toString(10) + '.min.css');
                    break;
                }
            }
        }
    }

    private static OnDownloadComplete(): void {
        // Restart listeners for keyboard and connection data
        this._Timer = setInterval((): void => { this.OnTimer(); }, 250);
    }

    private static OnMenuButtonClick(e: Event): boolean {
        this._MenuButtons.style.display = (this._MenuButtons.style.display == 'none') ? 'block' : 'none';
        this._MenuButtons.style.left = Offset.getOffset(this._MenuButton).x + 'px';
        this._MenuButtons.style.top = Offset.getOffset(this._MenuButton).y - this._MenuButtons.clientHeight + 'px';
        e.preventDefault();
        return false;
    }

    private static OnTimer(): void {
        if ((this._Connection !== null) && (this._Connection.connected)) {
            // Check for focus change
            if (document.hasFocus() && !this._HasFocus) {
                this._HasFocus = true;
                this._FocusWarningBar.style.display = 'none';
            } else if (!document.hasFocus() && this._HasFocus) {
                this._HasFocus = false;
                this._FocusWarningBar.style.display = 'block';
            }

            // Check for scrollback
            if (DetectMobileBrowser.SupportsModernScrollback) {
                var ScrolledUp = (this._ClientContainer.scrollHeight - this._ClientContainer.scrollTop - this._ClientContainer.clientHeight > 1);
                if (ScrolledUp && (this._ScrollbackBar.style.display == 'none')) {
                    this._ScrollbackBar.style.display = 'block';
                } else if (!ScrolledUp && (this._ScrollbackBar.style.display == 'block')) {
                    this._ScrollbackBar.style.display = 'none';
                }
            }
        } else {
            if (this._FocusWarningBar.style.display == 'block') {
                this._FocusWarningBar.style.display = 'none';
            }
            if (this._ScrollbackBar.style.display == 'block') {
                this._ScrollbackBar.style.display = 'none';
            }
        }
    }

    private static OnUploadComplete(): void {
        // Restart listeners for keyboard and connection data
        this._Timer = setInterval((): void => { this.OnTimer(); }, 250);
    }

    public static OnUploadFileSelected(): void {
        if (this._Connection === null) { return; }
        if (!this._Connection.connected) { return; }

        var fTelentUpload: HTMLInputElement = <HTMLInputElement>document.getElementById('fTelnetUpload');

        // Get the YModemSend class ready to go
        this._YModemSend = new YModemSend(this._Connection);

        // Setup the listeners
        clearInterval(this._Timer);
        this._Timer = null;
        this._YModemSend.ontransfercomplete.on((): void => { this.OnUploadComplete(); });

        // Loop through the FileList and prep them for upload
        for (var i: number = 0; i < fTelentUpload.files.length; i++) {
            this.UploadFile(fTelentUpload.files[i], fTelentUpload.files.length);
        }
    }

    public static get Port(): number {
        return this._Port;
    }

    public static set Port(value: number) {
        this._Port = value;
    }

    public static get ProxyHostname(): string {
        return this._ProxyHostname;
    }

    public static set ProxyHostname(value: string) {
        this._ProxyHostname = value;
    }

    public static get ProxyPort(): number {
        return this._ProxyPort;
    }

    public static set ProxyPort(value: number) {
        this._ProxyPort = value;
    }

    public static get ProxyPortSecure(): number {
        return this._ProxyPortSecure;
    }

    public static set ProxyPortSecure(value: number) {
        this._ProxyPortSecure = value;
    }

    public static get RLoginClientUsername(): string {
        return this._RLoginClientUsername;
    }

    public static set RLoginClientUsername(value: string) {
        this._RLoginClientUsername = value;
    }

    public static get RLoginServerUsername(): string {
        return this._RLoginServerUsername;
    }

    public static set RLoginServerUsername(value: string) {
        this._RLoginServerUsername = value;
    }

    public static get RLoginTerminalType(): string {
        return this._RLoginTerminalType;
    }

    public static set RLoginTerminalType(value: string) {
        this._RLoginTerminalType = value;
    }

    public static get ScreenColumns(): number {
        return this._ScreenColumns;
    }

    public static set ScreenColumns(value: number) {
        this._ScreenColumns = value;
    }

    public static get ScreenRows(): number {
        return this._ScreenRows;
    }

    public static set ScreenRows(value: number) {
        this._ScreenRows = value;
    }

    public static get SplashScreen(): string {
        return this._SplashScreen;
    }

    public static set SplashScreen(value: string) {
        this._SplashScreen = value;
    }

    public static get StatusBarVisible(): boolean {
        return this._StatusBarVisible;
    }

    public static set StatusBarVisible(value: boolean) {
        this._StatusBarVisible = value;

        if (this._StatusBar != null) {
            this._StatusBar.style.display = (value ? 'block' : 'none');
        }
    }

    public static StuffInputBuffer(text: string): void {
        for (var i: number = 0; i < text.length; i++) {
            Crt.PushKeyPress(text.charCodeAt(i), 0, false, false, false);
        }
    }

    public static Upload(): void {
        // Hide the menu buttons (in case we clicked the Connect menu button)
        if (this._MenuButtons !== null) this._MenuButtons.style.display = 'none';

        if (this._Connection === null) { return; }
        if (!this._Connection.connected) { return; }

        document.getElementById('fTelnetUpload').click();
    }

    private static UploadFile(file: File, fileCount: number): void {
        var reader: FileReader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (): void => {
            var FR: FileRecord = new FileRecord(file.name, file.size);
            var Buffer: ArrayBuffer = reader.result;
            var Bytes: Uint8Array = new Uint8Array(Buffer);
            for (var i: number = 0; i < Bytes.length; i++) {
                FR.data.writeByte(Bytes[i]);
            }
            FR.data.position = 0;
            this._YModemSend.Upload(FR, fileCount);
        };

        // Read in the image file as a data URL.
        reader.readAsArrayBuffer(file);
    }

    public static get VirtualKeyboardVisible(): boolean {
        return this._VirtualKeyboardVisible;
    }

    public static set VirtualKeyboardVisible(value: boolean) {
        // Hide the menu buttons (in case we clicked the Connect menu button)
        if (this._MenuButtons !== null) this._MenuButtons.style.display = 'none';

        this._VirtualKeyboardVisible = value;
        VirtualKeyboard.Visible = value;
    }
}
