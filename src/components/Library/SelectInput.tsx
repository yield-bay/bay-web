import AsyncSelect from "react-select/async";
import { arrayofItemsForFilteration } from "@utils/filterationMethods";
// import Select from "react-select";
// import makeAnimated from "react-select/animated";

export default function SelectInput({ farms, setSearchArray }: any) {
  const totalOptions = arrayofItemsForFilteration(farms);

  const loadOptions = (searchValue: any, callback: any) => {
    setTimeout(() => {
      const filteredOptions = totalOptions.filter((totalOption) =>
        totalOption.label.toLowerCase().includes(searchValue.toLowerCase())
      );
      callback(filteredOptions);
    }, 500);
  };

  return (
    <div className="flex w-max">
      <AsyncSelect
        placeholder="search by token, chain or protocol name"
        onChange={(selection) => setSearchArray(selection)}
        loadOptions={loadOptions} // it loads the options on search. doesn't load it all at once.
        isMulti
        className="w-full sm:w-4/5 md:w-full min-w-max lg:min-w-[480px] text-baseBlue font-semibold text-[13px] md:text-lg"
        // options={options}
        // defaultOptions={protocols} // render all your data. not good if there's big amount of data
      />
    </div>
  );
}
