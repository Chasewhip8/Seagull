import { Fragment, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { classNames } from "utils/styles";
import { WrappedImage } from "./common/WrappedImage";

type SelectorItem<T> = {
  id: string;
  name: string;
  image: string;
  details: string;
  data: T
};

type Props<T> = {
  className?: string;
  label?: string;
  items: SelectorItem<T>[];
  onChange?: (value: T) => void
};

function Selector<T>(props: Props<T>) {
  const { items } = props;

  const [selected, setSelected] = useState<SelectorItem<T>>(() => {
    const defaultItem = items ? items[0] : null;
    if (props.onChange){
      props.onChange(defaultItem?.data);
    }
    return defaultItem;
  });

  return (
      <div className={props.className}>
        <Listbox value={selected} onChange={(newValue) => {
          setSelected(newValue);
          if (props.onChange){
            props.onChange(newValue.data);
          }
        }}>
          {({ open }) => (
              <>
                {props.label ? (
                    <Listbox.Label className="block text-sm font-medium text-gray-700">
                      {props.label}
                    </Listbox.Label>
                ) : null}
                <div className="relative mt-1">
                  <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
                <span className="flex items-center">
                        <WrappedImage
                            width={24}
                            height={24}
                            src={selected.image}
                            alt={selected.details}
                            className="flex-shrink-0 rounded-full"
                        />
                  <span className="ml-3 inline-flex w-full truncate">
                    <span className="truncate">{selected.name}</span>
                    <span className="ml-2 truncate hidden md:block text-gray-500">
                      {selected.details}
                    </span>
                  </span>
                </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                  <ChevronUpDownIcon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                  />
                </span>
                  </Listbox.Button>

                  <Transition
                      show={open}
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {items.map((item) => (
                          <Listbox.Option
                              key={item.id}
                              className={({ active }) =>
                                  classNames(
                                      active ? "text-white bg-indigo-600" : "text-gray-900",
                                      "relative cursor-default select-none py-2 pl-3 pr-9"
                                  )
                              }
                              value={item}
                          >
                            {({ selected, active }) => (
                                <>
                                  <div className="flex items-center">
                                    <WrappedImage
                                        width={24}
                                        height={24}
                                        src={item.image}
                                        alt={item.details}
                                        className="flex-shrink-0 rounded-full"
                                    />
                                    <span
                                        className={classNames(
                                            selected ? "font-semibold" : "font-normal",
                                            "ml-3 block truncate"
                                        )}
                                    >
                              {item.name}
                            </span>
                                  </div>

                                  {selected ? (
                                      <span
                                          className={classNames(
                                              active ? "text-white" : "text-indigo-600",
                                              "absolute inset-y-0 right-0 flex items-center pr-4"
                                          )}
                                      >
                              <CheckIcon
                                  className="h-5 w-5"
                                  aria-hidden="true"
                              />
                            </span>
                                  ) : null}
                                </>
                            )}
                          </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </>
          )}
        </Listbox>
      </div>
  );
}

export default Selector;
