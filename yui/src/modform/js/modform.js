// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/** global: M */
/** global: Y */

M.mod_bigbluebuttonbn = M.mod_bigbluebuttonbn || {};

M.mod_bigbluebuttonbn.modform = {

    bigbluebuttonbn: {},
    strings: {},

    /**
     * Initialise the broker code.
     *
     * @method init
     */
    init: function(bigbluebuttonbn) {
        this.bigbluebuttonbn = bigbluebuttonbn;
        this.strings = {
            as: M.str.bigbluebuttonbn.mod_form_field_participant_list_text_as,
            viewer: M.str.bigbluebuttonbn.mod_form_field_participant_bbb_role_viewer,
            moderator: M.str.bigbluebuttonbn.mod_form_field_participant_bbb_role_moderator,
            remove: M.str.bigbluebuttonbn.mod_form_field_participant_list_action_remove
        };
        this.updateInstanceTypeProfile();
        this.participantListInit();
    },

    updateInstanceTypeProfile: function() {
        var selected_type, profile_type;
        selected_type = Y.one('#id_type');
        profile_type = this.bigbluebuttonbn.instance_type_room_only;
        if (selected_type !== null) {
            profile_type = selected_type.get('value');
        }
        this.applyInstanceTypeProfile(this.bigbluebuttonbn.instance_type_profiles[profile_type]);
    },

    applyInstanceTypeProfile: function(instance_type_profile) {
        var features = instance_type_profile.features;
        var show_all = features.includes('all');
        // Show room settings validation.
        this.showFieldset('id_room', show_all || features.includes('showroom'));
        // Show recordings settings validation.
        this.showFieldset('id_recordings', show_all || features.includes('showrecordings'));
        this.showInput('id_recordings_imported', features.includes('showrecordings'));
        // Preuploadpresentation feature validation.
        this.showFieldset('id_preuploadpresentation', show_all ||
            features.includes('preuploadpresentation'));
        // Participants feature validation.
        this.showFieldset('id_permissions', show_all || features.includes('permissions'));
        // Schedule feature validation.
        this.showFieldset('id_schedule', show_all || features.includes('schedule'));
    },

    showFieldset: function(id, show) {
        // Show room settings validation.
        var fieldset = Y.DOM.byId(id);
        if (!fieldset) {
            return;
        }
        if (show) {
            Y.DOM.setStyle(fieldset, 'display', 'block');
            return;
        }
        Y.DOM.setStyle(fieldset, 'display', 'none');
    },

    showInput: function(id, show) {
        // Show room settings validation.
        var inputset = Y.DOM.byId(id);
        if (!inputset) {
            return;
        }
        var node = Y.one(inputset).ancestor('div').ancestor('div');
        if (show) {
            node.setStyle('display', 'block');
            return;
        }
        node.setStyle('display', 'none');
    },

    participantSelectionSet: function() {
        this.selectClear('bigbluebuttonbn_participant_selection');
        var type = document.getElementById('bigbluebuttonbn_participant_selection_type');
        for (var i = 0; i < type.options.length; i++) {
            if (type.options[i].selected) {
                var options = this.bigbluebuttonbn.participant_data[type.options[i].value].children;
                for (var option in options) {
                    if (options.hasOwnProperty(option)) {
                        this.selectAddOption(
                            'bigbluebuttonbn_participant_selection', options[option].name, options[option].id
                        );
                    }
                }
                if (type.options[i].value === 'all') {
                    this.selectAddOption('bigbluebuttonbn_participant_selection',
                        '---------------', 'all');
                    this.selectDisable('bigbluebuttonbn_participant_selection');
                } else {
                    this.selectEnable('bigbluebuttonbn_participant_selection');
                }
            }
        }
    },

    participantListInit: function() {
        var selection_type_value, selection_value, selection_role, participant_selection_types;
        for (var i = 0; i < this.bigbluebuttonbn.participant_list.length; i++) {
            selection_type_value = this.bigbluebuttonbn.participant_list[i].selectiontype;
            selection_value = this.bigbluebuttonbn.participant_list[i].selectionid;
            selection_role = this.bigbluebuttonbn.participant_list[i].role;
            participant_selection_types = this.bigbluebuttonbn.participant_data[selection_type_value];
            if (selection_type_value != 'all' && typeof participant_selection_types.children[selection_value] == 'undefined') {
                // Remove from memory.
                this.participantRemoveFromMemory(selection_type_value, selection_value);
                continue;
            }
            // Add it to the form.
            this.participantAddToForm(selection_type_value, selection_value, selection_role);
        }
        // Update in the form.
        this.participantListUpdate();
    },

    participantListUpdate: function() {
        var participant_list = document.getElementsByName('participants')[0];
        participant_list.value = JSON.stringify(this.bigbluebuttonbn.participant_list).replace(/"/g, '&quot;');
    },

    participantRemove: function(selection_type_value, selection_value) {
        // Remove from memory.
        this.participantRemoveFromMemory(selection_type_value, selection_value);

        // Remove from the form.
        this.participantRemoveFromForm(selection_type_value, selection_value);

        // Update in the form.
        this.participantListUpdate();
    },

    participantRemoveFromMemory: function(selection_type_value, selection_value) {
        var selectionid = (selection_value === '' ? null : selection_value);
        for (var i = 0; i < this.bigbluebuttonbn.participant_list.length; i++) {
            if (this.bigbluebuttonbn.participant_list[i].selectiontype == selection_type_value &&
                this.bigbluebuttonbn.participant_list[i].selectionid == selectionid) {
                this.bigbluebuttonbn.participant_list.splice(i, 1);
            }
        }
    },

    participantRemoveFromForm: function(selection_type_value, selection_value) {
        var id = 'participant_list_tr_' + selection_type_value + '-' + selection_value;
        var participant_list_table = document.getElementById('participant_list_table');
        for (var i = 0; i < participant_list_table.rows.length; i++) {
            if (participant_list_table.rows[i].id == id) {
                participant_list_table.deleteRow(i);
            }
        }
    },

    participantAdd: function() {
        var selection_type = document.getElementById('bigbluebuttonbn_participant_selection_type');
        var selection = document.getElementById('bigbluebuttonbn_participant_selection');
        // Lookup to see if it has been added already.
        for (var i = 0; i < this.bigbluebuttonbn.participant_list.length; i++) {
            if (this.bigbluebuttonbn.participant_list[i].selectiontype == selection_type.value &&
                this.bigbluebuttonbn.participant_list[i].selectionid == selection.value) {
                return;
            }
        }
        // Add it to memory.
        this.participantAddToMemory(selection_type.value, selection.value);
        // Add it to the form.
        this.participantAddToForm(selection_type.value, selection.value, 'viewer');
        // Update in the form.
        this.participantListUpdate();
    },

    participantAddToMemory: function(selection_type_value, selection_value) {
        this.bigbluebuttonbn.participant_list.push({
            "selectiontype": selection_type_value,
            "selectionid": selection_value,
            "role": "viewer"
        });
    },

    participantAddToForm: function(selection_type_value, selection_value, selection_role) {
        var list_table, innerHTML, selected_html, remove_html, remove_class, bbb_roles, i, row, cell0, cell1, cell2, cell3;
        list_table = document.getElementById('participant_list_table');
        row = list_table.insertRow(list_table.rows.length);
        row.id = "participant_list_tr_" + selection_type_value + "-" + selection_value;
        cell0 = row.insertCell(0);
        cell0.width = "125px";
        cell0.innerHTML = '<b><i>' + this.bigbluebuttonbn.participant_data[selection_type_value].name;
        cell0.innerHTML += (selection_type_value !== 'all' ? ':&nbsp;' : '') + '</i></b>';
        cell1 = row.insertCell(1);
        cell1.innerHTML = '';
        if (selection_type_value !== 'all') {
            cell1.innerHTML = this.bigbluebuttonbn.participant_data[selection_type_value].children[selection_value].name;
        }
        innerHTML = '&nbsp;<i>' + this.strings.as + '</i>&nbsp;';
        innerHTML += '<select id="participant_list_role_' + selection_type_value + '-' + selection_value + '"';
        innerHTML += ' onchange="M.mod_bigbluebuttonbn.modform.participantListRoleUpdate(\'';
        innerHTML += selection_type_value + '\', \'' + selection_value;
        innerHTML += '\'); return 0;" class="select custom-select">';
        bbb_roles = ['viewer', 'moderator'];
        for (i = 0; i < bbb_roles.length; i++) {
            selected_html = '';
            if (bbb_roles[i] === selection_role) {
                selected_html = ' selected="selected"';
            }
            innerHTML += '<option value="' + bbb_roles[i] + '"' + selected_html + '>' + this.strings[bbb_roles[i]] + '</option>';
        }
        innerHTML += '</select>';
        cell2 = row.insertCell(2);
        cell2.innerHTML = innerHTML;
        cell3 = row.insertCell(3);
        cell3.width = "20px";
        remove_html = this.strings.remove;
        remove_class = "btn btn-secondary btn-sm";
        if (this.bigbluebuttonbn.icons_enabled) {
            remove_html = this.bigbluebuttonbn.pix_icon_delete;
            remove_class = "btn btn-link";
        }
        innerHTML = '<a class="' + remove_class + '" onclick="M.mod_bigbluebuttonbn.modform.participantRemove(\'';
        innerHTML += selection_type_value + '\', \'' + selection_value;
        innerHTML += '\'); return 0;" title="' + this.strings.remove + '">' + remove_html + '</a>';
        cell3.innerHTML = innerHTML;
    },

    participantListRoleUpdate: function(type, id) {
        // Update in memory.
        var participant_list_role_selection = document.getElementById('participant_list_role_' + type + '-' + id);
        for (var i = 0; i < this.bigbluebuttonbn.participant_list.length; i++) {
            if (this.bigbluebuttonbn.participant_list[i].selectiontype == type &&
                this.bigbluebuttonbn.participant_list[i].selectionid == (id === '' ? null : id)) {
                this.bigbluebuttonbn.participant_list[i].role = participant_list_role_selection.value;
            }
        }

        // Update in the form.
        this.participantListUpdate();
    },

    selectClear: function(id) {
        var select = document.getElementById(id);
        while (select.length > 0) {
            select.remove(select.length - 1);
        }
    },

    selectEnable: function(id) {
        var select = document.getElementById(id);
        select.disabled = false;
    },

    selectDisable: function(id) {
        var select = document.getElementById(id);
        select.disabled = true;
    },

    selectAddOption: function(id, text, value) {
        var select = document.getElementById(id);
        var option = document.createElement('option');
        option.text = text;
        option.value = value;
        select.add(option, option.length);
    }

};
