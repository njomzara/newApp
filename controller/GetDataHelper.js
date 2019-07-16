sap.ui.define([
	"sap/ui/base/Object"
], function(sapUiObject) {
	"use strict";
	return sapUiObject.extend("com.s4i.fiori.pmchangev2.controller.GetDataHelper", {
		
		//************ChangePaymentFreq******************************

		getDataChangePaymentFreq: function(that, setComboBox) {
			//Enable toolbar buttons
			that.setViewAttribute("/buttonSave", "true");
			that.setViewAttribute("/buttonSaveAndRelease", "true");
			that.setViewAttribute("/buttonRelease", "false");

			var oModel = that.getView().getModel("centralODataModel");
			var paymentFreqVhModel = that.getView().getModel("paymentFreqVhModel");
			var sPath;

			var aFilter = new Array();
			var filterByPmID;
			var contracts = that.getView().getModel("entryViewModel").getProperty("/To_Vertrag/results");
			
			for (var i=0; i<contracts.length; i++) {
			filterByPmID = new sap.ui.model.Filter("PmID", sap.ui.model.FilterOperator.EQ, contracts[i].PmID);
			aFilter.push(filterByPmID);
			}
	
			sPath = "/PaymentFreqVhSet";
			oModel.read(sPath, {
				filters: aFilter,
				urlParameters: {
					json: true
				},
				success: function(oData) {
					//Set front end model
					paymentFreqVhModel.setData(oData);
					//GetComboBox for payment frequency
					var comboBox = that.getView().byId("changePaymentFreqComboBox");

					//set selected item in combo box, if it is new
					if (setComboBox === true) {
						var item = comboBox.getItems()[((comboBox.getItems().length) - 1)];
						comboBox.setSelectedItem(item);
					}
					
					//Business Rules
					that.getBusinessRulesHelper().businessRulesOnGetDataChangePaymentFreq(that);

				}.bind(),
				error: function(oError) {
					that.getPopUpHelper().showErrorMsg(that, oError);
				}.bind()
			});

		},
		
		//************ChangeVariant******************************

		getDataChangeVariant: function(that, setComboBox) {
			//Enable toolbar buttons
			that.setViewAttribute("/buttonSave", "true");
			that.setViewAttribute("/buttonSaveAndRelease", "true");
			that.setViewAttribute("/buttonRelease", "false");

			var oModel = that.getView().getModel("centralODataModel");
			var model = that.getView().getModel("entryViewModel");
			var productVariantVhModel = that.getView().getModel("productVariantVhModel");

			//Set BackUP Model
			var bindingPath = that.byId("changeVariantContainer").getBindingContext("entryViewModel").sPath;
			var newO = that.getGenericFunctionsHelper().deepCopy(model.getProperty(bindingPath));
			that.getView().getModel("ChangeVariantBackUpModel").setData(that.getGenericFunctionsHelper().getFlatObject("To_AendereProdvar", newO, false));

			var selectedContract = model.getProperty(bindingPath);
			var sPolicyNumber = model.getData().Policennummer;

			//Get Old Premium on Contract Level
			that.byId("contractPremOldChangeVariant").setText(that.getPremiumsDeltaCalculationHelper().getContractPremiumFromBackUpModel(that, selectedContract.VertragID));

/*			var sPath = "/VertragSet(Policennummer='" + sPolicyNumber + "',Vertragsnummer='" + selectedContract.Vertragsnummer + "',PmID='" +
				selectedContract.PmID + "')/To_ProductVariantVh";
			oModel.read(sPath, {
				urlParameters: {
					json: true
				},
				success: function(oData) {
					//Set front end model
					productVariantVhModel.setData(oData);
					//GetComboBox for payment frequency
					var comboBox = that.getView().byId("changeVariantComboBox");

					//set selected item in combo box, if it is new
					if (setComboBox === true) {
						var item = comboBox.getItems()[((comboBox.getItems().length) - 1)];
						comboBox.setSelectedItem(item);
					}

				},
				error: function(oError) {
					that.getPopUpHelper().showErrorMsg(that, oError);
				}
			});*/

		},
		
		//************ChangeInsuranceCov******************************

		getDataChangeInsuranceCov: function(that) {
			//Enable toolbar buttons
			that.setViewAttribute("/buttonSave", "true");
			that.setViewAttribute("/buttonSaveAndRelease", "true");
			that.setViewAttribute("/buttonRelease", "false");

			var oModel = that.getView().getModel("centralODataModel");
			var model = that.getView().getModel("entryViewModel");
			var productVariantVhModel = that.getView().getModel("productVariantVhModel");

			//Set BackUP Model
			var bindingPath = that.byId("changeInsuranceCovContainer").getBindingContext("entryViewModel").sPath;
			var newO = that.getGenericFunctionsHelper().deepCopy(model.getProperty(bindingPath));
			that.getView().getModel("To_ChangeInsuranceCovBackUpModel").setData(that.getGenericFunctionsHelper().getFlatObject("To_ChangeInsuranceCov", newO, false));

			var selectedContract = model.getProperty(bindingPath);
			var sPolicyNumber = model.getData().Policennummer;

			var sPath = "/VertragSet(Policennummer='" + sPolicyNumber + "',Vertragsnummer='" + selectedContract.Vertragsnummer + "',PmID='" +
				selectedContract.PmID + "')/To_ProductVariantVh";
			oModel.read(sPath, {
				urlParameters: {
					json: true
				},
				success: function(oData) {
					//Set front end model
					productVariantVhModel.setData(oData);
					that.getBusinessRulesHelper().businessRulesOnGetDataChangeInsuranceCov(that);

				}.bind(),
				error: function(oError) {
					that.getPopUpHelper().showErrorMsg(that, oError);
				}.bind(that)
			});

		},
		
		//************ChangeDeductible******************************

		getDataChangeDeductible: function(that) {
			//Enable toolbar buttons
			that.setViewAttribute("/buttonSave", "true");
			that.setViewAttribute("/buttonSaveAndRelease", "true");
			that.setViewAttribute("/buttonRelease", "false");

			var model = that.getView().getModel("entryViewModel");
			
			//Business Rules
			that.getBusinessRulesHelper().businessRulesOnGetDataChangeDeductible(that);

			//Set BackUP Model
			var bindingPath = that.byId("changeDeductibleContainer").getBindingContext("entryViewModel").sPath;
			var newO = that.getGenericFunctionsHelper().deepCopy(model.getProperty(bindingPath));
			that.getView().getModel("To_ChangeDeductibleBackUpModel").setData(that.getGenericFunctionsHelper().getFlatObject("To_ChangeDeductible", newO, false));

		},
		
		//************ChangePaymentOption******************************

		getDataChangePaymentOption: function(that, setComboBox) {
			//Enable toolbar buttons
			that.setViewAttribute("/buttonSave", "true");
			that.setViewAttribute("/buttonSaveAndRelease", "true");
			that.setViewAttribute("/buttonRelease", "false");

			var oModel = that.getView().getModel("centralODataModel");
			var premPayerModel = that.getView().getModel("premPayerModel");
			var sPath;

			//Get bank accounts from premapayer
			var sPremPayer = premPayerModel.getData().PremPayerBpID;
			sPath = "/PremPayerSet('" + sPremPayer + "')/To_BankAccount";
			oModel.read(sPath, {
				urlParameters: {
					json: true
				},
				success: function(oData) {
					//Set front end model
					premPayerModel.setProperty("/To_BankAccount", oData);

					if (setComboBox === true) {
						//set selected item in combo box, if it is new
						var comboBox = that.getView().byId("changePaymentOptionComboBox");
						var item = comboBox.getItems()[((comboBox.getItems().length) - 1)];
						comboBox.setSelectedItem(item);
					}

				}.bind(that),
				error: function(oError) {
					that.getPopUpHelper().showErrorMsg(that, oError);
				}.bind(that)
			});

		},
		
		//************MoveAddress******************************

		getDataMoveAddress: function(that) {
			//Set toolbar buttons
			that.setViewAttribute("/buttonSave", "false");

			that.setViewAttribute("/buttonRelease", "false");

			var oModel = that.getView().getModel("centralODataModel");
			var policyHolderModel = that.getView().getModel("policyHolderModel");
			var checkAdressBackUpModel = that.getView().getModel("To_CheckAdressBackUpModel");
			var sPath;

			//Get Address of Policy Holder 
			var sPolicyHolder = policyHolderModel.getData().PolHldrBpID;
			sPath = "/PolHldrSet('" + sPolicyHolder + "')/To_Address";
			oModel.read(sPath, {
				urlParameters: {
					json: true
				},
				success: function(oData) {
					//Set front end model
					policyHolderModel.setProperty("/To_Address", oData);

					//Set BackUpModel
					checkAdressBackUpModel.setData(oData);

				},
				error: function(oError) {
					that.getPopUpHelper().showErrorMsg(that, oError);
				}.bind()
			});
		},
		
		//************AddCoInsuredPerson******************************

		getDataAddCoInsuredPerson: function(that) {
			//Enable toolbar buttons
			that.setViewAttribute("/buttonSave", "true");
			that.setViewAttribute("/buttonSaveAndRelease", "true");
			that.setViewAttribute("/buttonRelease", "false");

			var model = that.getView().getModel("entryViewModel");

			//Set BackUP Model
			var bindingPath = that.byId("addCoInsuredPersonContainer").getBindingContext("entryViewModel").sPath;
			var newO = that.getGenericFunctionsHelper().deepCopy(model.getProperty(bindingPath));
			that.getView().getModel("To_CoInsuredPersonBackUpModel").setData(that.getGenericFunctionsHelper().getFlatObject("To_CoInsuredPerson", newO, false));

			//Get selected contract
			var selectedContract = that.getView().getModel("entryViewModel").getProperty(bindingPath);
			that.byId("contractPremOldAddCoInsuredPerson").setText(that.getPremiumsDeltaCalculationHelper().getContractPremiumFromBackUpModel(that, selectedContract.VertragID));
		},

		getDataChangeSubjAttr: function(that) {
			var model = that.getView().getModel("entryViewModel");
			//Set BackUP Model
			var bindingPath = that.byId("changeSubjAttrContainer").getBindingContext("entryViewModel").sPath;
			var newO = that.getGenericFunctionsHelper().deepCopy(model.getProperty(bindingPath));
			that.getView().getModel("To_ChangeSubjAttrBackUpModel").setData(that.getGenericFunctionsHelper().getFlatObject("To_ChangeSubjAttr", newO, false));
		}

	});
});