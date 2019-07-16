sap.ui.define([
	"sap/ui/base/Object",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/Input",
	"sap/m/DatePicker",
	"sap/m/Switch",
	"sap/m/HBox",
	"sap/m/MessageToast",
	"sap/m/Text"
], function(sapUiObject, Button, Dialog, Input, DatePicker, Switch, HBox, MessageToast, Text) {
	"use strict";
	return sapUiObject.extend("com.s4i.fiori.pmchangev2.controller.PopUpHelper", {

		//************Generic Dialog for showing an Error Message******************************

		showErrorMsg: function(that, oError) {
			that.setViewAttribute("/busy", false);
			var errorMsg;
			try {
				errorMsg = JSON.parse(oError.responseText).error.message.value;
			} catch (err) {
				var xml = new DOMParser().parseFromString(oError.responseText, 'text/xml');
				var newJsonObject = that.getGenericFunctionsHelper().xmlToJsonObject(xml);
				try {
					errorMsg = newJsonObject.error.message;
				} catch (err2) {
					errorMsg = newJsonObject.html.body.h1;
				}

			}
			
			var oBundel = that.getView().getModel("i18n").getResourceBundle();

			var dialog = new Dialog({
				title: oBundel.getText("errorLabel"),
				type: 'Message',
				state: 'Error',
				content: new Text({
					text: errorMsg
				}),
				beginButton: new Button({
					text: 'OK',
					press: function() {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});

			dialog.open();
		},

		//************Shows Release Message******************************

		showReleaseMsgAndCloseWindow: function(that) {
			that.setViewAttribute("/busy", false);

			var oBundel = that.getView().getModel("i18n").getResourceBundle();

			var dialog = new Dialog({
				title: oBundel.getText("releaseLabel"),
				type: 'Message',
				state: 'Success',
				content: new Text({
					text: oBundel.getText("successfullyReleasedLabel")
				}),
				beginButton: new Button({
					text: 'OK',
					press: function() {
						window.open('', '_self', ''); //bug fix (Chrome)
						window.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
					window.close();
				}
			});

			dialog.open();
		},

		//************Opens Policynumber Dialog and triggers complete Refresh******************************

		openPolicyNumberPopUp: function(that, sPolicyNumber) {

			var oBundel = that.getView().getModel("i18n").getResourceBundle();

			if (!that._oPolicyNumberDialog) {
				that._oPolicyNumberDialog = new Dialog({
					title: oBundel.getText("policyNumberPopUp"),
					type: "Message",
					content: [
						new Text({
							text: oBundel.getText("policennummerPopupText")
						}),
						// Eingabefeld für Altvertrag
						new Input("submitPolicyNumberTextarea", {
							liveChange: function(oEvent) {
								var sText = oEvent.getParameter("value");
								var parent = oEvent.getSource().getParent();

								// weiter Button aktivieren falls in diesem Feld und dem für den Neuvertrag etwas drin steht
								parent.getBeginButton().setEnabled(
									sText.length > 0);

							},
							submit: function() {
								var enteredSPolicyNumber = sap.ui.getCore().byId("submitPolicyNumberTextarea").getValue();
								// eventuell vom Copy/Paste vorhandene Leerzeichen entfernen
								enteredSPolicyNumber = jQuery.trim(enteredSPolicyNumber);
								that._oPolicyNumberDialog.close();
								that.getBusinessLogicHelper().completeRefresh(that, enteredSPolicyNumber);
								that.getBusinessLogicHelper().createBackUpModels(that);
							},
							value: sPolicyNumber,
							width: "100%",
							editable: true,
							enabled: true
						})
					],
					// Weiter Button zum Abschluß der Eingabe
					beginButton: new Button({
						text: oBundel.getText("continueButtonLabel"),
						enabled: false,
						press: function() {
							var enteredSPolicyNumber = sap.ui.getCore().byId("submitPolicyNumberTextarea").getValue();
							// eventuell vom Copy/Paste vorhandene Leerzeichen entfernen
							enteredSPolicyNumber = jQuery.trim(enteredSPolicyNumber);
							that._oPolicyNumberDialog.close();
							that.getBusinessLogicHelper().completeRefresh(that, enteredSPolicyNumber);
							that.getBusinessLogicHelper().createBackUpModels(that);
						}
					}),
					endButton: new Button({
						text: oBundel.getText("exitButtonLabel"),
						press: function() {
							window.open('', '_self', ''); //bug fix (Chrome)
							window.close();
						}
					})
				});
			} else {
				// wenn der Dialog bereits existiert muss das Feld neu gefüllt werden (ggf auch mit leerem String ->löschen)
				sap.ui.getCore().byId("submitPolicyNumberTextarea").setValue(sPolicyNumber);
			}

			// ... und aktiviere den Weiter Button
			that._oPolicyNumberDialog.getBeginButton().setEnabled(sap.ui.getCore().byId("submitPolicyNumberTextarea").getValue().length > 0);
			that._oPolicyNumberDialog.open();
		},

		//************Opens Effective Date Dialog and triggers save or simulate******************************

		openEffectiveDateDialog: function(that, procedure) {

			var oBundel = that.getView().getModel("i18n").getResourceBundle();

			if (!this._oEffectiveDateDialog) {
				this._oEffectiveDateDialog = new Dialog({
					title: oBundel.getText("effectiveDatePopUp"),
					type: "Message",
					content: [
						new Text({
							width: "30em",
							text: oBundel.getText("insertEffectiveDateText")
						}),

						new DatePicker("submitEffectiveDateTextarea", {
							dateValue: new Date(),
							change: function() {
								var effectiveDate = sap.ui.getCore().byId("submitEffectiveDateTextarea").getDateValue();
								var mainMaturity = that.getView().getModel("entryViewModel").getProperty("/MainMaturity");
								if (effectiveDate.getYear() === mainMaturity.getYear() &&
									effectiveDate.getMonth() === mainMaturity.getMonth() &&
									effectiveDate.getDate() === mainMaturity.getDate()) {
									sap.ui.getCore().byId("mainMaturitySwitch").setState(true);
								} else {
									sap.ui.getCore().byId("mainMaturitySwitch").setState(false);
								}

							}
						}),
						new HBox({
							width: "10em",
							items: []
						}),
						new Text({
							width: "13em",
							text: oBundel.getText("mainMaturityDateText")
						}),
						new Switch("mainMaturitySwitch", {
							state: false,
							customTextOn: oBundel.getText("yesLabel"),
							customTextOff: oBundel.getText("noLabel"),
							change: function() {
								if (sap.ui.getCore().byId("mainMaturitySwitch").getState() === true) {
									//sap.ui.getCore().byId("submitEffectiveDateTextarea").setEnabled(false);
									sap.ui.getCore().byId("submitEffectiveDateTextarea").setDateValue(that.getView().getModel("entryViewModel").getProperty(
										"/MainMaturity"));
								} else {
									//sap.ui.getCore().byId("submitEffectiveDateTextarea").setEnabled(true);
									sap.ui.getCore().byId("submitEffectiveDateTextarea").setDateValue(new Date());
								}
							}

						})
					/*	,

						new HBox({
							width: "10em",
							items: []
						}),

						new Text({
							width: "13em",
							text: oBundel.getText("deallocateAddendumText")
						}),
						new Switch("deallocateAddendumSwitch", {
							state: false,
							customTextOn: oBundel.getText("yesLabel"),
							customTextOff: oBundel.getText("noLabel"),
							change: function() {
									if (sap.ui.getCore().byId("deallocateAddendumSwitch").getState() === true) {
										that.setGlobalDeallocateAddendum(true);
									} else {
										that.setGlobalDeallocateAddendum(false);
									}
								}
						})*/
					],

					//Cancel Button to Close the Window
					endButton: new Button({
						text: oBundel.getText("cancelButtonText"),
						press: function() {

							this._oEffectiveDateDialog.close();
							this._oEffectiveDateDialog.destroy(true);
							this._oEffectiveDateDialog = null;
						}.bind(this)
					}),
					// Continue Button
					beginButton: new Button({
						text: oBundel.getText("nextButtonText"),
						enabled: false,
						press: function() {
							var enteredEffectiveDate = sap.ui.getCore().byId("submitEffectiveDateTextarea").getDateValue();

							var oModel = that.getView().getModel("centralODataModel");
							var sPath = "/CheckChBeforeChSet";
							var oPayload = {
								Policennummer: that.getView().getModel("entryViewModel").getData().Policennummer,
								EffectiveDate: enteredEffectiveDate
							};

							oModel.create(sPath, oPayload, {
								urlParameters: {
									json: true
								},
								success: function(oData) {
									if (oData.ChangeBeforeChange === false) {
										that.setGlobaleffectiveDate(enteredEffectiveDate);
										this._oEffectiveDateDialog.close();
										that.getBusinessLogicHelper()._saveOrSimulate(that, procedure);
									} else {
										this._oEffectiveDateDialog.close();
										MessageToast.show(oData.ChangeBeforeChangeTT);
										that.getBusinessLogicHelper().checkAndOpenEffectiveDatePopUpPLUSSaveOrSimulateButtonPressed(that, procedure);
									}
								}.bind(this),
								error: function(oError) {
									this.showErrorMsg(this, oError);
								}.bind(this)
							});

						}.bind(this)
					})
				});
			}
			//Business Rules
			that.getBusinessRulesHelper().businessRulesOnOpenEffectiveDateDialog(that, that.getViewAttribute("/viewName"));

			//Activate Go Button and open PopUp
			this._oEffectiveDateDialog.getBeginButton().setEnabled(sap.ui.getCore().byId("submitEffectiveDateTextarea").getValue().length >
				0);
			this._oEffectiveDateDialog.open();

		},

		//************Asks User for further Changes and opens effective Date PopUp******************************

		openFurtherChangesPopUp: function(that) {

			var oBundel = that.getView().getModel("i18n").getResourceBundle();
			if (!this._oSaveDialog) {
				this._oSaveDialog = new Dialog({
					title: oBundel.getText("saveReleasePopUp"),
					type: "Message",
					content: new Text({
						text: oBundel.getText("saveReleaseText")
					}),
					// Ja nur Speichern
					beginButton: new Button({
						text: oBundel.getText("yesText"),
						enabled: false,
						press: function() {
							this._oSaveDialog.close();
							that.getBusinessLogicHelper().checkAndOpenEffectiveDatePopUpPLUSSaveOrSimulateButtonPressed(that, "E");
						}.bind(this)
					}),
					// Nein Freigabe
					endButton: new Button({
						text: oBundel.getText("noText"),
						press: function() {
							this._oSaveDialog.close();
							that.getBusinessLogicHelper().checkAndOpenEffectiveDatePopUpPLUSSaveOrSimulateButtonPressed(that, "R");
						}.bind(this)
					})
				});
			}
			this._oSaveDialog.getBeginButton().setEnabled(true);
			this._oSaveDialog.open();

		},

		//************Shows no suggestion found PopUp in Move Fragment******************************

		openMoveNoSuggestionFoundPopUp: function(that, oPayload) {

			var oBundel = that.getView().getModel("i18n").getResourceBundle();

			this._oSuggestMoveDialog = new Dialog({
				title: oBundel.getText("noSuggestionFoundPopUp"),
				type: "Message",
				content: new Text({
					text: oBundel.getText("noSuggestionFoundText") + " " + oPayload.AddressAttributes.Street + " " +
						oPayload.AddressAttributes.HouseNumber + ", " + oPayload.AddressAttributes.PostalCode +
						", " + oPayload.AddressAttributes.City
				}),
				// Yes, address is valid
				beginButton: new Button({
					text: oBundel.getText("yesText"),
					press: function() {
						this._oSuggestMoveDialog.close();
						that.onSaveAddressButtonPressed();
					}.bind(this)
				}),
				// No, not Valid
				endButton: new Button({
					text: oBundel.getText("noText"),
					press: function() {
						this._oSuggestMoveDialog.close();
					}.bind(this)
				})
			});
			this._oSuggestMoveDialog.open();
		},

		//************Notifies the User that he is about to close the window with an open application and asks for action******************************

		openCancelPopUp: function(that) {
			var oBundel = that.getView().getModel("i18n").getResourceBundle();
			if (!this._oCancelDialog) {
				this._oCancelDialog = new Dialog({
					title: oBundel.getText("cancelPopUp"),
					type: "Message",
					content: new Text({
						text: oBundel.getText("cancelText")
					}),
					beginButton: new Button({
						text: oBundel.getText("yesText"),
						enabled: false,
						press: function() {
							that.onCancelButtonPressed();
						}.bind(this)
					}),
					endButton: new Button({
						text: oBundel.getText("noText"),
						press: function() {
							//Close Window
							window.open('', '_self', ''); //bug fix (Chrome)
							window.close();
						}
					})
				});
			}
			this._oCancelDialog.getBeginButton().setEnabled(true);
			this._oCancelDialog.open();
		}
	});
});