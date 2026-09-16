'use strict';
'require view';
'require fs';
'require ui';
'require poll';

return view.extend({
	handleSave: null,
	handleSaveApply: null,
	handleReset: null,

	statusCommand: function() {
		return fs.exec('/usr/sbin/yase-netmode-status').catch(function() {
			return { stdout: '' };
		});
	},

	load: function() {
		return this.statusCommand();
	},

	parseStatus: function(res) {
		var data = {};

		(res.stdout || '').trim().split(/\n/).forEach(function(line) {
			var pos = line.indexOf('=');
			if (pos > -1)
				data[line.substring(0, pos)] = line.substring(pos + 1);
		});

		return data;
	},

	styleNode: function() {
		return E('style', {}, [
			'.h5net{--net-blue:#4f8ff7;--net-green:#31b985;--net-amber:#e7a33e;--net-red:#e45f5f;--net-blue-t:#1f5fbf;--net-green-t:#12784f;--net-amber-t:#8a5a12;--net-red-t:#b02a2a}',
			'[data-darkmode="true"] .h5net{--net-blue-t:#8ab4ff;--net-green-t:#4fd39c;--net-amber-t:#e7a33e;--net-red-t:#ff9a9a}',
			'.h5net-head{display:flex;justify-content:space-between;align-items:center;gap:18px;padding:2px 2px 14px;margin-bottom:14px;border-bottom:1px solid var(--border-color-low,#e8e8e8)}',
			'.h5net-head h2{margin:0 0 4px;font-size:22px;line-height:1.3}.h5net-head p{margin:0;color:var(--text-color-medium,#666);font-size:13px}',
			'.h5net-active{display:inline-flex;align-items:center;gap:7px;padding:6px 10px;border-radius:999px;background:rgba(49,185,133,.11);color:var(--net-green-t);font-size:12px;font-weight:600;white-space:nowrap}',
			'.h5net-active:before{content:"";width:7px;height:7px;border-radius:50%;background:currentColor}.h5net-active.warn{color:var(--net-amber-t);background:rgba(231,163,62,.11)}.h5net-active.fail{color:var(--net-red-t);background:rgba(228,95,95,.11)}',
			'.h5net-note{margin:0 0 14px;padding:10px 12px;border-left:3px solid var(--net-blue);border-radius:4px;background:rgba(79,143,247,.07);color:var(--text-color-medium,#555);font-size:13px}',
			'.h5net-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}',
			'.h5net-card{position:relative;padding:15px;border:1px solid var(--border-color-medium,#ddd);border-left:3px solid transparent;border-radius:11px;background:var(--background-color-high,#fff)}',
			'.h5net-card.inuse{border-left-color:var(--net-green)}',
			'.h5net-cardtop{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.h5net-name{display:flex;align-items:center;gap:10px}',
			'.h5net-icon{display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:10px;background:rgba(79,143,247,.10);color:var(--net-blue-t);font-size:12px;font-weight:700}.h5net-card.modem .h5net-icon{background:rgba(49,185,133,.10);color:var(--net-green-t)}',
			'.h5net-name h3{margin:0 0 2px;font-size:16px}.h5net-role{color:var(--text-color-medium,#666);font-size:12px}',
			'.h5net-state{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:var(--text-color-medium,#666);white-space:nowrap}.h5net-state:before{content:"";width:7px;height:7px;border-radius:50%;background:currentColor}.h5net-state.up{color:var(--net-green-t)}',
			'.h5net-protos{display:flex;flex-wrap:wrap;gap:7px;margin-top:15px}.h5net-proto{padding:5px 8px;border-radius:7px;background:var(--background-color-low,#f5f5f5);font-size:12px;color:var(--text-color-medium,#666)}.h5net-proto.current{background:rgba(49,185,133,.11);color:var(--net-green-t);font-weight:600}.h5net-proto.ready{background:rgba(79,143,247,.10);color:var(--net-blue-t);font-weight:600}',
			'.h5net-modes{margin-top:20px}',
			'.h5net-modes-label{margin:0 0 8px;color:var(--text-color-medium,#666);font-size:12px;font-weight:600}',
			'.h5net-seg{display:flex}',
			'.h5net-seg input{position:absolute;opacity:0;width:1px;height:1px;overflow:hidden}',
			'.h5net-seg label{flex:1 1 0;position:relative;padding:8px 10px;border:1px solid var(--border-color-medium,#ddd);margin-left:-1px;background:var(--background-color-high,#fff);color:var(--text-color-medium,#555);font-size:13px;text-align:center;cursor:pointer;user-select:none;transition:background .15s,color .15s,border-color .15s}',
			'.h5net-seg label:hover{background:var(--background-color-low,#f5f5f5)}',
			'.h5net-seg label:first-of-type{margin-left:0;border-radius:7px 0 0 7px}',
			'.h5net-seg label:last-of-type{border-radius:0 7px 7px 0}',
			'.h5net-seg input:checked + label{z-index:1;background:var(--net-blue);border-color:var(--net-blue);color:#fff;font-weight:600}',
			'.h5net-seg input:focus-visible + label{z-index:2;outline:2px solid var(--net-blue-t);outline-offset:2px}',
			'.h5net-actions{display:flex;justify-content:flex-end;align-items:center;margin-top:14px;padding-top:14px;border-top:1px solid var(--border-color-low,#e8e8e8)}.h5net-actions .cbi-button{min-width:112px}',
			'@media(max-width:620px){.h5net-head{display:block}.h5net-active{margin-top:11px}.h5net-grid{grid-template-columns:1fr}.h5net-seg label{padding:8px 4px;font-size:12px}.h5net-actions .cbi-button{width:100%}}'
		].join(''));
	},

	exitLabel: function(exit) {
		if (exit === 'wan') return _('Wired WAN');
		if (exit === 'modem') return _('5G modem');
		if (exit === 'other') return _('Other route');
		return _('No available exit');
	},

	modeOrder: function(mode) {
		if (mode === 'modem_first') return [ 'modem', 'wan' ];
		if (mode === 'wan_only') return [ 'wan' ];
		if (mode === 'modem_only') return [ 'modem' ];
		return [ 'wan', 'modem' ];
	},

	modeDefs: function() {
		return [
			{ id: 'wan_first', label: _('Wired WAN first') },
			{ id: 'modem_first', label: _('5G first') },
			{ id: 'wan_only', label: _('Wired WAN only') },
			{ id: 'modem_only', label: _('5G only') }
		];
	},

	roleLabel: function(mode, kind) {
		var order = this.modeOrder(mode);
		var position = order.indexOf(kind);
		if (position < 0) return _('Not selected');
		if (order.length === 1) return _('Only exit');
		return position === 0 ? '1 · ' + _('Preferred exit') : '2 · ' + _('Fallback exit');
	},

	connectionState: function(present, up) {
		if (present !== '1') return { label: _('Not configured'), cls: 'idle' };
		if (up === '1') return { label: _('Connected'), cls: 'up' };
		return { label: _('Disconnected'), cls: 'idle' };
	},

	modeChange: function(ev) {
		if (this.applying) return;

		this.pendingMode = ev.target.value;
		this.repaint();

		var input = document.getElementById('h5net-mode-' + this.pendingMode);
		if (input) input.focus();
	},

	modeSelector: function() {
		var children = [];

		this.modeDefs().forEach(L.bind(function(def) {
			children.push(E('input', {
				'type': 'radio',
				'name': 'h5net-mode',
				'id': 'h5net-mode-' + def.id,
				'value': def.id,
				'checked': this.pendingMode === def.id ? 'checked' : null,
				'change': L.bind(this.modeChange, this)
			}));
			children.push(E('label', { 'for': 'h5net-mode-' + def.id }, def.label));
		}, this));

		return E('div', { 'class': 'h5net-seg' }, children);
	},

	routeCard: function(kind, data) {
		var modem = kind === 'modem';
		var present = modem ? data.modem_present : data.wan_present;
		var up4 = modem ? data.modem_up : data.wan_up;
		var up6 = modem ? data.modem6_up : data.wan6_up;
		var ready4 = modem ? (data.modem4_ready || up4) : (data.wan4_ready || up4);
		var ready6 = modem ? (data.modem6_ready || up6) : (data.wan6_ready || up6);
		var active4 = data.active4 === kind;
		var active6 = data.active6 === kind;
		var state = this.connectionState(present, (up4 === '1' || up6 === '1') ? '1' : '0');
		var cls = 'h5net-card ' + (modem ? 'modem' : 'wan') + ((active4 || active6) ? ' inuse' : '');

		return E('div', { 'class': cls }, [
			E('div', { 'class': 'h5net-cardtop' }, [
				E('div', { 'class': 'h5net-name' }, [
					E('div', { 'class': 'h5net-icon', 'aria-hidden': 'true' }, modem ? '5G' : 'WAN'),
					E('div', {}, [
						E('h3', {}, modem ? _('5G modem') : _('Wired WAN')),
						E('div', { 'class': 'h5net-role' }, this.roleLabel(this.pendingMode, kind))
					])
				]),
				E('div', { 'class': 'h5net-state ' + state.cls }, state.label)
			]),
			E('div', { 'class': 'h5net-protos' }, [
				E('span', { 'class': 'h5net-proto' + (active4 ? ' current' : (ready4 === '1' ? ' ready' : '')) }, active4 ? _('IPv4 in use') : (ready4 === '1' ? _('IPv4 ready') : _('IPv4 unavailable'))),
				E('span', { 'class': 'h5net-proto' + (active6 ? ' current' : (ready6 === '1' ? ' ready' : '')) }, active6 ? _('IPv6 in use') : (ready6 === '1' ? _('IPv6 ready') : _('IPv6 unavailable')))
			])
		]);
	},

	statusMessage: function(data) {
		var mode = data.mode;
		var preferred = mode === 'modem_first' || mode === 'modem_only' ? 'modem' : 'wan';
		var fallback = preferred === 'wan' ? 'modem' : 'wan';
		var active = data.active4 !== 'none' ? data.active4 : data.active6;

		if (active === 'none') return _('No default route is currently available. Check the cable or 5G connection.');
		if (mode === 'wan_only' || mode === 'modem_only')
			return _('Only %s is enabled by the current policy.').format(this.exitLabel(preferred));
		if (active === fallback && data.active6 === 'none')
			return _('%s is unavailable, so IPv4 has switched to %s. IPv6 remains disabled to avoid splitting traffic across two exits.').format(this.exitLabel(preferred), this.exitLabel(fallback));
		if (active === fallback)
			return _('%s is unavailable, so traffic has switched to %s.').format(this.exitLabel(preferred), this.exitLabel(fallback));
		if (active === preferred && data.active6 === 'none')
			return _('IPv4 is using %s. IPv6 is unavailable on the preferred exit, so fallback IPv6 is disabled to avoid splitting traffic.').format(this.exitLabel(preferred));
		if (active === preferred)
			return _('IPv4 and IPv6 are using the preferred exit. The fallback will take over when needed.');
		return _('Traffic is currently using another default route.');
	},

	applySelection: function() {
		if (this.applying || this.pendingMode === this.liveData.mode) return;
		this.applying = true;
		this.repaint();

		return fs.exec('/usr/sbin/yase-netmode', [ 'set', this.pendingMode ]).then(L.bind(function() {
			ui.addNotification(null, E('p', _('Exit selection applied successfully.')));
			return new Promise(L.bind(function(resolve) {
				window.setTimeout(L.bind(function() {
					this.applying = false;
					this.refreshStatus().then(resolve);
				}, this), 1200);
			}, this));
		}, this), L.bind(function(err) {
			this.applying = false;
			this.repaint();
			ui.addNotification(null, E('p', _('Failed to apply exit selection:') + ' ' + (err.message || _('Unknown error'))), 'danger');
		}, this));
	},

	statusPanel: function(data) {
		var same, active, badgeText, badgeClass, changed;
		data.mode = data.mode || 'wan_first';
		data.active4 = data.active4 || 'none';
		data.active6 = data.active6 || 'none';
		same = data.active4 === data.active6 && data.active4 !== 'none';
		active = data.active4 !== 'none' ? data.active4 : data.active6;
		badgeText = same ? _('Current exit: %s').format(this.exitLabel(active)) : _('IPv4: %s · IPv6: %s').format(this.exitLabel(data.active4), this.exitLabel(data.active6));
		badgeClass = 'h5net-active' + (active === 'none' ? ' fail' : (active === 'other' ? ' warn' : ''));
		changed = this.pendingMode !== data.mode;

		return E('div', { 'class': 'h5net', id: 'h5net-status' }, [
			this.styleNode(),
			E('div', { 'class': 'h5net-head' }, [
				E('div', {}, [ E('h2', {}, _('Network exits')), E('p', {}, _('Pick an exit mode below and apply it. The cards only show live status.')) ]),
				E('div', { 'class': badgeClass }, badgeText)
			]),
			E('div', { 'class': 'h5net-note' }, this.statusMessage(data)),
			E('div', { 'class': 'h5net-grid' }, [ this.routeCard('wan', data), this.routeCard('modem', data) ]),
			E('div', { 'class': 'h5net-modes' }, [
				E('div', { 'class': 'h5net-modes-label' }, _('Exit mode')),
				this.modeSelector()
			]),
			E('div', { 'class': 'h5net-actions' }, [
				E('button', {
					'class': 'cbi-button cbi-button-apply',
					'disabled': (!changed || this.applying) ? 'disabled' : null,
					'click': L.bind(this.applySelection, this)
				}, this.applying ? _('Applying…') : _('Apply settings'))
			])
		]);
	},

	repaint: function() {
		var old = document.getElementById('h5net-status');
		if (old && this.liveData)
			old.parentNode.replaceChild(this.statusPanel(this.liveData), old);
	},

	refreshStatus: function() {
		return this.statusCommand().then(L.bind(function(res) {
			var dirty;

			this.liveData = this.parseStatus(res);
			dirty = this.pendingMode !== (this.liveData.mode || 'wan_first');
			if (!this.applying && !dirty) {
				this.pendingMode = this.liveData.mode || 'wan_first';
				this.repaint();
			}
		}, this));
	},

	render: function(res) {
		this.liveData = this.parseStatus(res);
		this.liveData.mode = this.liveData.mode || 'wan_first';
		this.pendingMode = this.liveData.mode;
		this.applying = false;
		poll.add(L.bind(this.refreshStatus, this), 5);
		return this.statusPanel(this.liveData);
	}
});
