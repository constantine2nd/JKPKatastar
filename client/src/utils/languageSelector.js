import { MRT_Localization_HU } from "material-react-table/locales/hu";
//Import Material React Table Translations
import { MRT_Localization_SR_CYRL_RS } from "material-react-table/locales/sr-Cyrl-RS";
//Import Material React Table Translations
import { MRT_Localization_SR_LATN_RS } from "material-react-table/locales/sr-Latn-RS";

const getLanguage = (i18n) => {
    if (i18n.language.toUpperCase() === "SR") {
      return MRT_Localization_SR_LATN_RS;
    } else if (i18n.language.toUpperCase() === "HU") {
      return MRT_Localization_HU;
    } else {
      return MRT_Localization_SR_CYRL_RS;
    }
  };
  export { getLanguage };