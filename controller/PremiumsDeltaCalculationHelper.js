sap.ui.define([
	"sap/ui/base/Object"
], function(sapUiObject) {
	"use strict";
	return sapUiObject.extend("com.s4i.fiori.pmchangev2.controller.PremiumsDeltaCalculationHelper", {
		
		

		updateContratPremiums: function(that, concatenatedStringOfPremiums, ProratedPremPoliceTT) {

			//Spilt into Contracts
			var arrayOfContracts = concatenatedStringOfPremiums.split('|');
			var arrayOfIdAndPremium;

			//Loop over contracts
			for (var i = 0; i < arrayOfContracts.length; i++) {

				//Split in id and premium
				arrayOfIdAndPremium = arrayOfContracts[i].split('_');

				//loop over entry view model and update contract premium
				var model = that.getView().getModel("entryViewModel");
				var arrayOfContractsInModel = model.getData().To_Vertrag.results;
				for (var j = 0; j < arrayOfContractsInModel.length; j++) {
					if (arrayOfContractsInModel[j].VertragID.toString() === arrayOfIdAndPremium[0]) {
						model.setProperty("/To_Vertrag/results/" + j + "/ProratedPrem", arrayOfIdAndPremium[1]);
						model.setProperty("/To_Vertrag/results/" + j + "/ProratedPremTT", ProratedPremPoliceTT);
						break;
					}
				}

			}
		},

		setInitialPremiumsBackUpModel: function(that) {
			var newObj = that.getGenericFunctionsHelper().deepCopy(that.getView().getModel("entryViewModel").getData());
			var PremiumsBackUpModel = that.getView().getModel("PremiumsBackUpModel");
			var contracts = newObj.To_Vertrag.results;
			var concatenatedStringOfContractPremiums;
			var element;

			for (var i = 0; i < contracts.length; i++) {
				element = contracts[i].VertragID + "_" + contracts[i].ProratedPrem.substr(0, contracts[i].ProratedPrem.length - 1);
				if (concatenatedStringOfContractPremiums === undefined) {
					concatenatedStringOfContractPremiums = element;
				} else {
					concatenatedStringOfContractPremiums = concatenatedStringOfContractPremiums + "|" + element;
				}

			}

			PremiumsBackUpModel.setProperty("/ProratedPremPolicy", newObj.ProratedPrem);
			PremiumsBackUpModel.setProperty("/ProratedPremTT", newObj.ProratedPremTT);
			PremiumsBackUpModel.setProperty("/ConcatenatedStringOfContractPremiums", concatenatedStringOfContractPremiums);
		},

		updatePremiumModels: function(that, ConcatenatedStringOfContractPremiums, ProratedPremPolicy, ProratedPremTT, UpdateBackUpModel) {
			var PremiumsBackUpModel = that.getView().getModel("PremiumsBackUpModel");
			var arrayOfContractsWithPremiumsInBackUpModel = [];
			var arrayOfContractsWithPremiumsInString = [];

			//Split String
			var arrayOfContracts = ConcatenatedStringOfContractPremiums.split("|");
			for (var a = 0; a < arrayOfContracts.length; a++) {
				arrayOfContractsWithPremiumsInString[a] = arrayOfContracts[a].split("_");
			}

			//Split BackUp Model
			arrayOfContracts = PremiumsBackUpModel.getProperty("/ConcatenatedStringOfContractPremiums").split("|");
			for (var b = 0; b < arrayOfContracts.length; b++) {
				arrayOfContractsWithPremiumsInBackUpModel[b] = arrayOfContracts[b].split("_");
			}

			//Update Premiums in Array
			for (var c = 0; c < arrayOfContractsWithPremiumsInString.length; c++) {
				for (var d = 0; d < arrayOfContractsWithPremiumsInBackUpModel.length; d++) {
					if (arrayOfContractsWithPremiumsInString[c][0] === arrayOfContractsWithPremiumsInBackUpModel[d][0]) {
						arrayOfContractsWithPremiumsInBackUpModel[d][1] = arrayOfContractsWithPremiumsInString[c][1];
						break;
					}
				}
			}

			//Build new String
			ConcatenatedStringOfContractPremiums = "";
			for (var e = 0; e < arrayOfContractsWithPremiumsInBackUpModel.length; e++) {
				if (e !== 0) {
					ConcatenatedStringOfContractPremiums = ConcatenatedStringOfContractPremiums + "|";
				}
				ConcatenatedStringOfContractPremiums = ConcatenatedStringOfContractPremiums + arrayOfContractsWithPremiumsInBackUpModel[e][0] +
					"_" + arrayOfContractsWithPremiumsInBackUpModel[e][1];
			}

			//Check if ProratedPrem is inital
			//-> No Prorated Prem on Policy Level -> Action on Contract Level -> New PolicyPrem needs to be calculated
			if (ProratedPremPolicy === "") {
				var localPremAsFloat = 0.00;
				var model = that.getView().getModel("entryViewModel");
				for (var f = 0; f < arrayOfContractsWithPremiumsInBackUpModel.length; f++) {
					localPremAsFloat = localPremAsFloat + parseFloat(arrayOfContractsWithPremiumsInBackUpModel[f][1]);
				}
				ProratedPremPolicy = localPremAsFloat.toString();
				model.setProperty("/Jahresbetrag", "Not calculated due to activitys on contract level");
				model.setProperty("/ProratedPrem", ProratedPremPolicy);

			}

			if (UpdateBackUpModel === true) {
				PremiumsBackUpModel.setProperty("/ProratedPremPolicy", ProratedPremPolicy);
				PremiumsBackUpModel.setProperty("/ProratedPremTT", ProratedPremTT);
				PremiumsBackUpModel.setProperty("/ConcatenatedStringOfContractPremiums", ConcatenatedStringOfContractPremiums);
			}

		},

		resetPremiums: function(that) {
			var model = that.getView().getModel("entryViewModel");
			var PremiumsBackUpModel = that.getView().getModel("PremiumsBackUpModel");
			model.setProperty("/ProratedPrem", PremiumsBackUpModel.getProperty("/ProratedPremPolicy"));
			model.setProperty("/ProratedPremTT", PremiumsBackUpModel.getProperty("/ProratedPremTT"));

			this.updateContratPremiums(that, PremiumsBackUpModel.getProperty("/ConcatenatedStringOfContractPremiums"), PremiumsBackUpModel.getProperty(
				"/ProratedPremTT"));
		},

		getContractPremiumFromBackUpModel: function(that, ContractID) {
			//Convert to String
			ContractID = ContractID.toString();
			//Get Model and String
			var PremiumsBackUpModel = that.getView().getModel("PremiumsBackUpModel");
			var concatenatedStringOfPremiums = PremiumsBackUpModel.getProperty("/ConcatenatedStringOfContractPremiums");

			//Spilt into Contracts
			var arrayOfContracts = concatenatedStringOfPremiums.split('|');
			var arrayOfIdAndPremium;

			//Loop over contracts
			for (var i = 0; i < arrayOfContracts.length; i++) {

				//Split in id and premium
				arrayOfIdAndPremium = arrayOfContracts[i].split('_');

				//loop over entry view model and update contract premium
				for (var a = 0; a < arrayOfIdAndPremium.length; a++) {
					if (arrayOfIdAndPremium[0] === ContractID) {
						return that.formatter.currencyFormatter(arrayOfIdAndPremium[1], that.getView().getModel("entryViewModel").getProperty("/Currency"));
					}

				}

			}

		}

	});
});