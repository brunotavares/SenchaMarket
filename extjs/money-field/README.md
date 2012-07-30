# Ext.ux.form.field.Money

**Check live demo here:**

Most of numeric fields that promise Money formatting have such strict rules that using them is a pain for the user, but this
one is pretty simple. It just formats the value when the user leaves the field, and provide a consistent API for developers.

It provides:

* keystroke filtering to disallow non-numeric characters. Also, if the user types the decimal separator, the field does not allow
a second typing of the same character.

* Formats number adding decimal and centesimal separators.

!https://raw.github.com/brunotavares/SenchaMarket/master/extjs/money-field/printscreen.jpg!

## Getting Started

This distribution already comes exemplified. You just have to get the code and open test.html to see it running.

## Usage

1. Copy Money.js to your application (e.g. {root}/lib/ux/form/field/).
Inform Ext.ux path to Ext Loader. If you follow the suggestion above: 

        Ext.Loader.setPath('Ext.ux', 'lib/ux');

2. Add to requirements on top of app.js

        Ext.require('Ext.ux.form.field.Money');

3. Use it!

        Ext.create('Ext.window.Window',{
            autoShow: true,
            items: {
                xtype: 'moneyfield'
            }
        });
        
        
## API

The API is very consistent and plays nice with the backend. You won't have values like '1,236.22' saved in your database. Everything
is a Number instance. The only time this number instance will be transformed into string, is to make it pretty to the user. On the 
background, everything should be a number (or a string respecting Number.toString() format).

### maxLength

The config maxLength is valid for the count of numbers present on the integer part of the value, ignoring decimal numbers and separators. 
The decimal part is controlled by the decimalPrecision, and separators are just decoration.

E.g.:
 - maxLength 6 enforces a number not bigger than 9,999,999.
 - maxLength 2 validates 12.2565 (4 as decimalPrecision) but not 125.2 (1 as decimalPrecision).

### setValue(number/string)

Set value will always work passing a number or a string respecting the format '2512512512512.22' (no centesimal separators and using
'.' as decimal separator).

### getValue()

getValue is the method developers use to handle form values, making advanced validations, mixing and transforming, etc... So getValue()
here always returns a Number instance, nothing but a Number.

Developers can customize the decimalSeparator, centesimalSeparator and the maxLength. The max length is based on number of
numeric characters (e.g. 7 for 1,000,000).        


