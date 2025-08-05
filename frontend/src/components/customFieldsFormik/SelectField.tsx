import { isDefine } from '@/helpers/common';
import { AdditionalFormikProps, SelectOption } from '@/interfaces/common';
import { cn } from '@/lib/utils';
import { get, isEmpty, isString, toString } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import CommonIcons from '../commonIcons';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Command, CommandGroup, CommandInput, CommandItem } from '../ui/command';
import { Label } from '../ui/label';
import Loading from '../ui/loading';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import ScrollWrapper from '../ui/ScrollWrapper';

interface SelectFieldProps {
  label?: string | React.ReactNode;
  required?: boolean;
  classNameLabel?: string;
  classNameContainer?: string;
  placeholder?: string;
  placeholderSearch?: string;
  messageItemNotFound?: string;
  options: SelectOption[];
  disabled?: boolean;
  afterOnChange?: (e?: SelectOption | SelectOption[]) => void;
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onSearchAPI?: (value: any) => void;
  handleLoadMore?: () => void;
  currentPage?: number;
  onToggle?: (open: boolean) => void;
  className?: string;
  defaultValue?: string;
  shouldHideSearch?: boolean;
  hideIconCheck?: boolean;
  icon?: React.ReactNode;
  onKeyDown?: (e: any) => void;
  multiple?: boolean;
  onSelect?: (option: any, valueOption?: SelectOption[], deleteItem?: any) => void;
}

const SelectField = (props: SelectFieldProps & AdditionalFormikProps) => {
  //! State
  const {
    options,
    classNameContainer,
    field,
    form,
    label,
    classNameLabel,
    placeholder,
    placeholderSearch,
    messageItemNotFound,
    required,
    disabled,
    afterOnChange,
    loading,
    loadingMore,
    hasMore,
    handleLoadMore,
    onSearchAPI,
    onToggle,
    className,
    defaultValue,
    shouldHideSearch = false,
    hideIconCheck = false,
    icon,
    multiple,
    onSelect,
  } = props;

  const [open, setOpen] = useState(false);
  const [prevOpen, setPrevOpen] = useState(false);
  const { value, name } = field;
  const { setFieldValue, setFieldTouched, errors, touched, values } = form;
  const buttonRef = useRef<HTMLButtonElement>(null);

  const msgError =
    get(touched, name) &&
    (multiple ? isEmpty(value) : isEmpty(value) || value === '') &&
    (get(errors, name) as string);

  //! Function
  // Handle click outside - close popover - set field as touched
  useEffect(() => {
    if (prevOpen !== open) {
      setPrevOpen(open);
      if (!open) {
        setFieldTouched(name, true);
      }
    }
  }, [open, prevOpen, name, setFieldTouched]);

  // Handle selection logic
  const handleSelect = useCallback(
    (option: SelectOption) => {
      if (multiple) {
        const currentValue: SelectOption[] = isEmpty(value) ? [] : value;
        const newValue = currentValue.find((el) => el.value === option.value)
          ? currentValue.filter((el) => el.value !== option.value)
          : [...currentValue, option];

        if (onSelect) {
          onSelect(option, newValue);
        } else {
          setFieldValue(name, newValue);
          afterOnChange && afterOnChange(newValue);
        }
      } else {
        const result = `${value}` === `${option.value}` ? '' : option.value;
        setFieldValue(name, result);
        afterOnChange && afterOnChange(result ? option : undefined);
      }
      setOpen(false);
    },
    [multiple, value, name, setFieldValue, onSelect, afterOnChange],
  );

  // Handle removal of a selected item in multi-select mode
  const handleRemove = useCallback(
    (item: SelectOption) => {
      const currentValue: SelectOption[] = isEmpty(value) ? [] : [...value];
      const newValue = currentValue.filter((el) => el.value !== item.value);
      if (onSelect) {
        onSelect(item, newValue, item);
      } else {
        setFieldValue(name, newValue);
      }
    },
    [value, name, setFieldValue, onSelect],
  );

  //! Render
  const widthPopover = buttonRef.current?.getBoundingClientRect().width || 0;

  const renderValue = () => {
    if (isDefine(value)) {
      if (multiple) {
        const optionValue = values[name] || [];
        return (
          <div className="flex flex-wrap gap-2">
            {optionValue.map((el: SelectOption) => (
              <Badge
                key={el.value}
                className="bg-bg-bgBagde text-text-six hover:bg-bg-bgBagde h-[40px] !rounded-[4px] font-normal"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex content-between items-center gap-2">
                  <div className="typo-3">{el?.label}</div>
                  <CommonIcons.XIcon size={20} onClick={() => handleRemove(el)} />
                </div>
              </Badge>
            ))}
          </div>
        );
      }
      const valueResult = options.find((option) => `${option.value}` === `${value}`);
      return valueResult ? valueResult?.label : defaultValue;
    } else {
      if (defaultValue) {
        return defaultValue;
      } else {
        return <div className="typo-3 2xl:text-typo-2">{placeholder}</div>;
      }
    }
  };

  return (
    <div className={twMerge('grid w-full gap-1.5', classNameContainer)}>
      {label && (
        <Label
          className={twMerge(
            'typo-7 mb-1 block font-medium text-black',
            required && 'required',
            classNameLabel,
          )}
        >
          {label}
        </Label>
      )}
      <Popover
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
          onToggle?.(open);
        }}
      >
        <PopoverTrigger disabled={disabled} className="w-full">
          <Button
            ref={buttonRef}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={twMerge(
              'flex w-full justify-between',
              multiple ? 'h-fit' : '',
              !value && 'text-muted-foreground',
              disabled && 'bg-disabled',
              msgError && 'border-red-500',
              value && !disabled && 'text-black',
            )}
          >
            <div
              className={twMerge(
                'grow text-left font-normal',
                !value && '!text-muted-foreground',
                multiple && isEmpty(value) ? '!text-muted-foreground' : 'truncate',
                className,
              )}
            >
              {renderValue()}
            </div>
            {icon ? icon : <CommonIcons.ChevronDown className="ml-2 h-6 w-6 shrink-0" />}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          style={{
            width: widthPopover,
            position: 'relative',
          }}
        >
          <Command shouldFilter={onSearchAPI ? false : true}>
            {!shouldHideSearch && (
              <CommandInput
                style={{ letterSpacing: '2px' }}
                onValueChange={onSearchAPI ? onSearchAPI : undefined}
                placeholder={placeholderSearch || 'Search...'}
              />
            )}
            <div className={'relative'}>
              {isEmpty(options) && (
                <div className="flex justify-center">{messageItemNotFound || 'No item found.'}</div>
              )}

              <CommandGroup className={'max-h-[200px] overflow-auto'}>
                <ScrollWrapper
                  key={`${loading}`}
                  onScrollEnd={() => {
                    if (hasMore && !loading && !loadingMore) {
                      handleLoadMore?.();
                    }
                  }}
                >
                  {options.map((option) => {
                    if (option.isHide) return null;
                    const isChecked = multiple
                      ? !!(value || [])?.find((el: any) => el.value === option.value)
                      : value === option.value;
                    return (
                      <CommandItem
                        key={option.value}
                        value={toString(option.value)}
                        onSelect={() => handleSelect(option)}
                      >
                        {!hideIconCheck && (
                          <CommonIcons.Check
                            className={cn('mr-2 h-4 w-4', isChecked ? 'opacity-100' : 'opacity-0')}
                          />
                        )}
                        <div className="flex flex-col gap-1 tracking-[2px]">
                          <div className={option?.subLabel ? 'font-semibold' : 'font-normal'}>
                            {option.label}
                          </div>
                          <div className={'font-light'}>{option?.subLabel}</div>
                        </div>
                      </CommandItem>
                    );
                  })}
                </ScrollWrapper>
              </CommandGroup>
              {(loading || loadingMore) && (
                <div
                  className={
                    'absolute bottom-0 left-0 right-0 top-0 flex h-full w-full items-center justify-center backdrop-blur-sm'
                  }
                >
                  <Loading />
                </div>
              )}
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      {isString(msgError) && <span className="invalid-text typo-3">{msgError}</span>}
    </div>
  );
};

export default SelectField;
