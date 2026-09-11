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
		return E('style', { 'id': 'h5net-style' }, [
			'.h5net{--net-blue:#4f8ff7;--net-green:#31b985;--net-amber:#e7a33e;--net-red:#e45f5f;--net-blue-t:#1f5fbf;--net-green-t:#12784f;--net-amber-t:#8a5a12;--net-red-t:#b02a2a}',
			'[data-darkmode="true"] .h5net{--net-blue-t:#8ab4ff;--net-green-t:#4fd39c;--net-amber-t:#e7a33e;--net-red-t:#ff9a9a}',
			'.h5net-head{display:flex;justify-content:space-between;align-items:center;gap:18px;padding:2px 2px 14px;margin-bottom:14px;border-bottom:1px solid var(--border-color-low,#e8e8e8)}',
			'.h5net-head h2{margin:0 0 4px;font-size:22px;line-height:1.3}.h5net-head p{margin:0;color:var(--text-color-medium,#666);font-size:13px}',
			'.h5net-active{display:inline-flex;align-items:center;gap:7px;padding:6px 10px;border-radius:999px;background:rgba(49,185,133,.11);color:var(--net-green-t);font-size:12px;font-weight:600;white-space:nowrap}',
			'.h5net-active:before{content:"";width:7px;height:7px;border-radius:50%;background:currentColor}.h5net-active.warn{color:var(--net-amber-t);background:rgba(231,163,62,.11)}.h5net-active.fail{color:var(--net-red-t);background:rgba(228,95,95,.11)}',
			'.h5net-note{margin:0 0 14px;padding:10px 12px;border-left:3px solid var(--net-blue);border-radius:4px;background:rgba(79,143,247,.07);color:var(--text-color-medium,#555);font-size:13px}',
			'.h5net-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}',
			'.h5net-card{position:relative;padding:15px;border:1px solid var(--border-color-medium,#ddd);border-radius:11px;background:var(--background-color-high,#fff);transition:border-color .18s,box-shadow .18s}',
			'.h5net-card.selected{border-color:rgba(79,143,247,.72);box-shadow:0 0 0 2px rgba(79,143,247,.08)}.h5net-card.unselected{border-color:var(--border-color-low,#e8e8e8);background:var(--background-color-low,#f7f7f7)}.h5net-card.active{border-color:rgba(49,185,133,.65);box-shadow:0 0 0 2px rgba(49,185,133,.08);background:var(--background-color-high,#fff)}',
			'.h5net-cardtop{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.h5net-name{display:flex;align-items:center;gap:10px}',
			'.h5net-icon{display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:10px;background:rgba(79,143,247,.10);color:var(--net-blue-t);font-size:12px;font-weight:700}.h5net-card.modem .h5net-icon{background:rgba(49,185,133,.10);color:var(--net-green-t)}',
			'.h5net-name h3{margin:0 0 2px;font-size:16px}.h5net-role{color:var(--text-color-medium,#666);font-size:12px}.h5net-card.selected .h5net-role{color:var(--net-blue-t);font-weight:600}',
			'.h5net-state{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:var(--net-red-t);white-space:nowrap}.h5net-state:before{content:"";width:7px;height:7px;border-radius:50%;background:currentColor}.h5net-state.up{color:var(--net-green-t)}.h5net-state.idle{color:var(--text-color-medium,#666)}',
			'.h5net-protos{display:flex;flex-wrap:wrap;gap:7px;margin-top:15px}.h5net-proto{padding:5px 8px;border-radius:7px;background:var(--background-color-low,#f5f5f5);font-size:12px;color:var(--text-color-medium,#666)}.h5net-proto.current{background:rgba(49,185,133,.11);color:var(--net-green-t);font-weight:600}',
			'.h5net-chooser{margin-top:18px}',
			'.h5net-chooser-title{margin:0 0 10px;font-size:15px}',
			'.h5net-matrix{display:grid;grid-template-columns:auto minmax(0,1fr) minmax(0,1fr);grid-template-rows:auto 1fr 1fr;gap:8px}',
			'.h5net-corner{grid-column:1;grid-row:1}',
			'.h5net-colhead{display:flex;align-items:flex-end;justify-content:center;padding-bottom:2px;font-size:12px;font-weight:600;color:var(--text-color-medium,#555)}',
			'.h5net-colhead.c1{grid-column:2;grid-row:1}.h5net-colhead.c2{grid-column:3;grid-row:1}',
			'.h5net-rowhead{display:flex;align-items:center;max-width:110px;padding-right:6px;font-size:12px;font-weight:600;color:var(--text-color-medium,#555)}',
			'.h5net-rowhead.r1{grid-column:1;grid-row:2}.h5net-rowhead.r2{grid-column:1;grid-row:3}',
			'.h5net-opt{position:relative;display:flex;flex-direction:column;justify-content:center;gap:3px;min-height:56px;padding:10px 12px;border:1px solid var(--border-color-medium,#ddd);border-radius:10px;background:var(--background-color-high,#fff);cursor:pointer;transition:border-color .18s,box-shadow .18s,background-color .18s}',
			'.h5net-opt.c1.r1{grid-column:2;grid-row:2}.h5net-opt.c2.r1{grid-column:3;grid-row:2}.h5net-opt.c1.r2{grid-column:2;grid-row:3}.h5net-opt.c2.r2{grid-column:3;grid-row:3}',
			'.h5net-opt input{position:absolute;width:1px;height:1px;margin:0;padding:0;border:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}',
			'.h5net-opt:focus-within{outline:2px solid var(--net-blue);outline-offset:2px}',
			'@media(hover:hover){.h5net-opt:hover{border-color:rgba(79,143,247,.5)}}',
			'.h5net-opt[data-checked="1"]{border-color:rgba(79,143,247,.72);background:rgba(79,143,247,.06);box-shadow:0 0 0 2px rgba(79,143,247,.08)}',
			'.h5net-opt-t{font-size:13px;font-weight:600}.h5net-opt[data-checked="1"] .h5net-opt-t{color:var(--net-blue-t)}',
			'.h5net-opt-d{font-size:12px;line-height:1.35;color:var(--text-color-medium,#666)}',
			'.h5net-actions{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:14px;padding-top:14px;border-top:1px solid var(--border-color-low,#e8e8e8)}.h5net-actions .cbi-button{min-width:112px}',
			'.h5net-hint-wrap{display:flex;align-items:center;gap:10px;min-width:0}',
			'.h5net-hint{font-size:12px;color:var(--net-amber-t)}',
			'.h5net-reset{padding:0;border:0;background:none;font-size:12px;color:var(--net-blue-t);text-decoration:underline;cursor:pointer;white-space:nowrap}',
			'@media(max-width:600px){.h5net-head{display:block}.h5net-active{margin-top:11px}.h5net-grid{grid-template-columns:1fr}.h5net-matrix{grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-rows:auto auto auto auto auto}.h5net-corner{display:none}.h5net-colhead.c1{grid-column:1;grid-row:2}.h5net-colhead.c2{grid-column:2;grid-row:2}.h5net-rowhead{max-width:none;padding:6px 0 0}.h5net-rowhead.r1{grid-column:1/-1;grid-row:1}.h5net-rowhead.r2{grid-column:1/-1;grid-row:4}.h5net-opt.c1.r1{grid-column:1;grid-row:3}.h5net-opt.c2.r1{grid-column:2;grid-row:3}.h5net-opt.c1.r2{grid-column:1;grid-row:5}.h5net-opt.c2.r2{grid-column:2;grid-row:5}.h5net-actions{display:block}.h5net-hint-wrap{margin-bottom:8px}.h5net-actions .cbi-button{width:100%}}'
		].join(''));
	},

	injectStyle: function() {
		if (document.getElementById('h5net-style')) return;
		document.head.appendChild(this.styleNode());
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

	modeOptions: function() {
		return [
			{
				mode: 'wan_first', col: 'c1', row: 'r1',
				title: _('Wired WAN preferred'),
				desc: _('Uses wired WAN. Switches to 5G automatically when it goes down.')
			},
			{
				mode: 'modem_first', col: 'c2', row: 'r1',
				title: _('5G preferred'),
				desc: _('Uses 5G. Switches to wired WAN automatically when it goes down.')
			},
			{
				mode: 'wan_only', col: 'c1', row: 'r2',
				title: _('Wired WAN only'),
				desc: _('Uses wired WAN only. The 5G link stays disabled.')
			},
			{
				mode: 'modem_only', col: 'c2', row: 'r2',
				title: _('5G only'),
				desc: _('Uses 5G only. The wired WAN link stays disabled.')
			}
		];
	},

	modeLink: function(mode) {
		if (mode === 'modem_first' || mode === 'modem_only') return 'modem';
		return 'wan';
	},

	modeIsExclusive: function(mode) {
		return mode === 'wan_only' || mode === 'modem_only';
	},

	roleLabel: function(mode, kind) {
		var order = this.modeOrder(mode);
		var position = order.indexOf(kind);

		if (position < 0) return _('Disabled by policy');
		if (order.length === 1) return _('Only exit');

		return position === 0 ? '1 · ' + _('Preferred exit') : '2 · ' + _('Fallback exit');
	},

	connectionState: function(present, up) {
		if (present !== '1') return { label: _('Not configured'), cls: 'idle' };
		if (up === '1') return { label: _('Connected'), cls: 'up' };
		return { label: _('Disconnected'), cls: '' };
	},

	linkUsable: function(kind, data) {
		var modem = kind === 'modem';
		var present = modem ? data.modem_present : data.wan_present;
		var up4 = modem ? data.modem_up : data.wan_up;
		var up6 = modem ? data.modem6_up : data.wan6_up;

		return present === '1' && (up4 === '1' || up6 === '1');
	},

	describeUnavailable: function(kind, data) {
		var modem = kind === 'modem';
		var present = modem ? data.modem_present : data.wan_present;

		if (present !== '1')
			return _('%s is not configured on this device. Choosing it as the only exit leaves no working route until it comes back.').format(modem ? _('5G modem') : _('Wired WAN'));

		return _('%s is currently down. Choosing it as the only exit leaves no working route until it comes back.').format(modem ? _('5G modem') : _('Wired WAN'));
	},

	confirmUnavailable: function(kind) {
		var text = this.describeUnavailable(kind, this.liveData);
		var settled = false;

		return new Promise(function(resolve) {
			function answer(confirmed) {
				if (settled) return;
				settled = true;
				ui.hideModal();
				resolve(confirmed);
			}

			ui.showModal(_('The selected link is not available'), [
				E('p', {}, text),
				E('div', { 'class': 'right' }, [
					E('button', { 'class': 'btn', 'click': function() { answer(false); } }, _('Cancel')),
					' ',
					E('button', { 'class': 'cbi-button cbi-button-action', 'click': function() { answer(true); } }, _('Continue'))
				])
			]);
		});
	},

	selectMode: function(mode) {
		this.pendingMode = mode;
		this.selectionBase = this.baselineMode;
		this.updatePanel();
	},

	resetSelection: function() {
		this.selectMode(this.baselineMode);
	},

	onModeSelect: function(mode) {
		var self = this;
		var kind;

		if (this.applying || mode === this.pendingMode) return;

		if (!this.modeIsExclusive(mode)) {
			this.selectMode(mode);
			return;
		}

		kind = this.modeLink(mode);

		if (this.linkUsable(kind, this.liveData)) {
			this.selectMode(mode);
			return;
		}

		this.confirmUnavailable(kind).then(function(confirmed) {
			if (confirmed) self.selectMode(mode);
			else self.updatePanel();
		});
	},

	cardNode: function(kind) {
		var modem = kind === 'modem';
		var role = E('div', { 'class': 'h5net-role' });
		var state = E('div', { 'class': 'h5net-state' });
		var proto4 = E('span', { 'class': 'h5net-proto' });
		var proto6 = E('span', { 'class': 'h5net-proto' });
		var card = E('div', { 'class': 'h5net-card ' + (modem ? 'modem' : 'wan') }, [
			E('div', { 'class': 'h5net-cardtop' }, [
				E('div', { 'class': 'h5net-name' }, [
					E('div', { 'class': 'h5net-icon' }, modem ? '5G' : 'WAN'),
					E('div', {}, [
						E('h3', {}, modem ? _('5G modem') : _('Wired WAN')),
						role
					])
				]),
				state
			]),
			E('div', { 'class': 'h5net-protos' }, [ proto4, proto6 ])
		]);

		return { card: card, role: role, state: state, proto4: proto4, proto6: proto6 };
	},

	updateCard: function(kind, data) {
		var ui = this.ui[kind];
		var modem = kind === 'modem';
		var present = modem ? data.modem_present : data.wan_present;
		var up4 = modem ? data.modem_up : data.wan_up;
		var up6 = modem ? data.modem6_up : data.wan6_up;
		var ready4 = modem ? (data.modem4_ready || up4) : (data.wan4_ready || up4);
		var ready6 = modem ? (data.modem6_ready || up6) : (data.wan6_ready || up6);
		var selected = this.modeOrder(this.baselineMode).indexOf(kind) > -1;
		var active4 = data.active4 === kind;
		var active6 = data.active6 === kind;
		var state = this.connectionState(present, (up4 === '1' || up6 === '1') ? '1' : '0');

		ui.card.className = 'h5net-card ' + (modem ? 'modem' : 'wan') + (selected ? ' selected' : ' unselected') + ((active4 || active6) ? ' active' : '');
		ui.role.textContent = this.roleLabel(this.baselineMode, kind);
		ui.state.className = 'h5net-state ' + state.cls;
		ui.state.textContent = state.label;
		ui.proto4.className = 'h5net-proto' + (active4 ? ' current' : '');
		ui.proto4.textContent = active4 ? _('IPv4 in use') : (ready4 === '1' ? _('IPv4 ready') : _('IPv4 unavailable'));
		ui.proto6.className = 'h5net-proto' + (active6 ? ' current' : '');
		ui.proto6.textContent = active6 ? _('IPv6 in use') : (ready6 === '1' ? _('IPv6 ready') : _('IPv6 unavailable'));
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

	applyErrText: function(err) {
		var message = (err && err.message) || '';

		if (message.indexOf('another exit policy update is already running') > -1)
			return _('Another exit policy update is running. Try again in a moment.');
		if (message.indexOf('network reload failed') > -1)
			return _('The mode was not saved and the network reload failed. Retry, or check the system log.');
		if (message.indexOf('failed to persist exit policy') > -1)
			return _('Failed to save the exit policy.');

		return _('Failed to apply exit selection:') + ' ' + (message || _('Unknown error'));
	},

	applySelection: function() {
		if (this.applying || this.pendingMode === this.baselineMode) return;
		this.applying = true;
		this.updatePanel();

		return fs.exec('/usr/sbin/yase-netmode', [ 'set', this.pendingMode ]).then(L.bind(function() {
			ui.addNotification(null, E('p', _('Exit selection applied successfully.')));
			this.selectionBase = this.pendingMode;
			return new Promise(L.bind(function(resolve) {
				window.setTimeout(L.bind(function() {
					this.applying = false;
					this.refreshStatus().then(resolve);
				}, this), 1200);
			}, this));
		}, this), L.bind(function(err) {
			this.applying = false;
			this.updatePanel();
			ui.addNotification(null, E('p', this.applyErrText(err)), 'danger');
		}, this));
	},

	buildChooser: function() {
		var defs = this.modeOptions();
		var options = [];
		var matrix = E('div', { 'class': 'h5net-matrix', 'role': 'group', 'aria-labelledby': 'h5net-chooser-title' }, [
			E('div', { 'class': 'h5net-corner', 'aria-hidden': 'true' }),
			E('div', { 'class': 'h5net-colhead c1', 'aria-hidden': 'true' }, _('Wired WAN')),
			E('div', { 'class': 'h5net-colhead c2', 'aria-hidden': 'true' }, _('5G modem')),
			E('div', { 'class': 'h5net-rowhead r1', 'aria-hidden': 'true' }, _('Automatic failover')),
			E('div', { 'class': 'h5net-rowhead r2', 'aria-hidden': 'true' }, _('Force a single exit'))
		]);
		var i, def, input, label;

		for (i = 0; i < defs.length; i++) {
			def = defs[i];
			input = E('input', {
				'type': 'radio',
				'name': 'h5net-mode',
				'value': def.mode,
				'change': L.bind(this.onModeSelect, this, def.mode)
			});
			label = E('label', { 'class': 'h5net-opt ' + def.col + ' ' + def.row }, [
				input,
				E('span', { 'class': 'h5net-opt-t' }, def.title),
				E('span', { 'class': 'h5net-opt-d' }, def.desc)
			]);

			matrix.appendChild(label);
			options.push({ mode: def.mode, input: input, label: label });
		}

		return {
			options: options,
			node: E('div', { 'class': 'h5net-chooser' }, [
				E('h3', { 'class': 'h5net-chooser-title', 'id': 'h5net-chooser-title' }, _('Exit mode')),
				matrix
			])
		};
	},

	buildPanel: function() {
		var wan = this.cardNode('wan');
		var modem = this.cardNode('modem');
		var badge = E('div', { 'class': 'h5net-active' });
		var note = E('div', { 'class': 'h5net-note' });
		var hint = E('span', { 'class': 'h5net-hint' });
		var reset = E('button', {
			'class': 'h5net-reset',
			'click': L.bind(this.resetSelection, this)
		}, _('Reset to the active mode'));
		var apply = E('button', {
			'class': 'cbi-button cbi-button-apply',
			'click': L.bind(this.applySelection, this)
		});
		var chooser = this.buildChooser();

		var root = E('div', { 'class': 'h5net', 'id': 'h5net-status' }, [
			E('div', { 'class': 'h5net-head' }, [
				E('div', {}, [
					E('h2', {}, _('Network exits')),
					E('p', {}, _('The cards show the live state of each link. Pick an exit mode below and apply it to change the policy.'))
				]),
				badge
			]),
			note,
			E('div', { 'class': 'h5net-grid' }, [ wan.card, modem.card ]),
			chooser.node,
			E('div', { 'class': 'h5net-actions' }, [
				E('div', { 'class': 'h5net-hint-wrap' }, [ hint, reset ]),
				apply
			])
		]);

		this.ui = {
			root: root, badge: badge, note: note, apply: apply, hint: hint, reset: reset,
			options: chooser.options, wan: wan, modem: modem
		};

		return root;
	},

	updatePanel: function() {
		var data = this.liveData;
		var same, active, changed, external, option, checked, i;

		if (!this.ui || !data) return;

		data.mode = data.mode || 'wan_first';
		data.active4 = data.active4 || 'none';
		data.active6 = data.active6 || 'none';
		same = data.active4 === data.active6 && data.active4 !== 'none';
		active = data.active4 !== 'none' ? data.active4 : data.active6;
		changed = this.pendingMode !== this.baselineMode;
		external = changed && this.selectionBase !== this.baselineMode;

		this.ui.badge.className = 'h5net-active' + (active === 'none' ? ' fail' : (active === 'other' ? ' warn' : ''));
		this.ui.badge.textContent = same ? _('Current exit: %s').format(this.exitLabel(active)) : _('IPv4: %s · IPv6: %s').format(this.exitLabel(data.active4), this.exitLabel(data.active6));
		this.ui.note.textContent = this.statusMessage(data);
		this.updateCard('wan', data);
		this.updateCard('modem', data);

		for (i = 0; i < this.ui.options.length; i++) {
			option = this.ui.options[i];
			checked = option.mode === this.pendingMode;
			option.input.checked = checked;

			if (checked) option.label.setAttribute('data-checked', '1');
			else option.label.removeAttribute('data-checked');
		}

		this.ui.hint.textContent = external
			? _('The active exit changed elsewhere. Your unapplied selection was kept.')
			: (changed ? _('Selected, not applied yet') : '');
		this.ui.reset.hidden = !external;
		this.ui.apply.disabled = (!changed || this.applying);
		this.ui.apply.textContent = this.applying ? _('Applying…') : _('Apply settings');
	},

	refreshStatus: function() {
		return this.statusCommand().then(L.bind(function(res) {
			this.liveData = this.parseStatus(res);
			this.baselineMode = this.liveData.mode || 'wan_first';
			this.updatePanel();
		}, this));
	},

	render: function(res) {
		this.liveData = this.parseStatus(res);
		this.liveData.mode = this.liveData.mode || 'wan_first';
		this.baselineMode = this.liveData.mode;
		this.pendingMode = this.baselineMode;
		this.selectionBase = this.baselineMode;
		this.applying = false;
		this.injectStyle();
		var root = this.buildPanel();
		this.updatePanel();
		poll.add(L.bind(this.refreshStatus, this), 5);
		return root;
	}
});
