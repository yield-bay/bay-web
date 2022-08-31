import AsyncSelect from "react-select/async";
import { arrayofItemsForFilteration } from "@utils/filterationMethods";
// import Select from "react-select";
// import makeAnimated from "react-select/animated";

export default function SelectInput({ farms }: any) {
  const handleSelect = (selection: any) => {
    console.log("select:", selection);
  };

  const totalOptions = arrayofItemsForFilteration(farms);

  const loadOptions = (searchValue: any, callback: any) => {
    setTimeout(() => {
      const filteredOptions = totalOptions.filter((totalOption) =>
        totalOption.label.toLowerCase().includes(searchValue.toLowerCase())
      );
      console.log("filter options", searchValue, filteredOptions);
      callback(filteredOptions);
    }, 500);
  };

  return (
    <div className="flex w-full">
      <AsyncSelect
        placeholder="search by token, chain or protocol name"
        onChange={handleSelect}
        loadOptions={loadOptions} // it loads the options on search. doesn't load it all at once.
        isMulti
        className="w-full sm:w-4/5 md:w-full min-w-max lg:min-w-[480px] text-baseBlue font-semibold text-sm md:text-lg"
        // options={options}
        // defaultOptions={protocols} // render all your data. not good if there's big amount of data
      />
    </div>
  );
}
