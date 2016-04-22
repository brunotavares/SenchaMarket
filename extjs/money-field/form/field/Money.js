/**
 * @author Bruno Tavares
 * @class Ext.ux.form.field.Money
 * 
 * Provides an easy to use numeric money field that has keystroke filtering to 
 * disallow non-numeric characters and also auto-formatting with decimal and 
 * centesimal separators.
 */
Ext.define('Ext.ux.form.field.Money', {
	extend: 'Ext.form.field.Text',
    alias: 'widget.moneyfield',

    hiddenName: '',
	decimalSeparator: '.',
	decimalPrecision: 2,
	allowDecimals	: true,
	allowNegative	: false,
	selectOnFocus	: true,
	
	/**
     * @cfg {Number} maxLength
     * Maximum numeric characters allowed for the integer part of the number. The decimal part is controlled by the
     * decimalPrecison config.
     */

	initComponent: function() {
	    var me = this;
	    
		//emptytext
		if(!me.emptyText){
			me.emptyText = '0' + me.decimalSeparator + '0' + Ext.String.repeat('0', me.decimalPrecision);
		}
		
		//decimal
		if(me.decimalPrecision <= 0){
			me.allowDecimals = false;
		}
		
		//allowed characters
		var allowed = '0123456789' + me.decimalSeparator;
		if(me.allowNegative){
			allowed += '-';
		}
		Ext.escapeRe(allowed);

		//max length
		if(me.maxLength){
			me.maxChars = this.maxLength;
			delete me.maxLength;
		}
		
		//config
		Ext.apply(me, {
			sign		: '',
			maskRe		: new RegExp('['+allowed+']'),
			stripCharsRe: new RegExp('[^'+allowed+',\\.]','gi')
		});
		
		me.callParent(arguments);
	},
	
    /**
     * Sets a numeric value into the field and runs the change detection and validation. Also applies any configured
     * {@link #emptyText} for text fields. To set the value directly without these inspections see {@link #setRawValue}.
     * @param {Number/String} value The value to set. It could be either a Number or a String respecting the format '0000.00',
     * meaning no centesimal separators and using '.' as decimal separator.
     * @return {Ext.form.field.Text} this
     */
	setValue: function(v) {
		var me = this,
		    vNumber = me.formatNumber(v);
		
		v = vNumber.replace('.',me.decimalSeparator);
		v = me.formatField(v);
		
		me.callParent([v]);
		
		if(me.hiddenField){
			me.hiddenField.value = vNumber;
		}
		
		return me;
	},
	
	getValue: function() {
		var v = this.callParent(arguments);
		return this.formatNumber(v, true);		
	},
	
	filterKeys : function(e) {
	    var decimalSeparator = this.decimalSeparator;
	    
        if(e.ctrlKey){
            return;
        }
        
        var k = e.getKey();
        if(Ext.isGecko && (e.isNavKeyPress() || k == e.BACKSPACE || (k == e.DELETE && e.button == -1))){
            return;
        }
        var cc = String.fromCharCode(e.getCharCode());
        if(!Ext.isGecko && e.isSpecialKey() && !cc){
            e.stopEvent();
            return;
        }
        if(!this.maskRe.test(cc)){
            e.stopEvent();
        }
        
        var v = this.getRawValue();
        
        //void typing 2 times the decimal separator
        if(cc === decimalSeparator && v.indexOf(decimalSeparator) !== -1){
			e.stopEvent();
		}
    },
    
    onBlur: function() {
        var me = this;
        
		//format
		var value = me.formatField(me.getRawValue());
		
		//set raw
		me.setRawValue(value);
		
		//set hidden
		if(me.hiddenField){
            me.hiddenField.value = me.formatNumber(value);
        }
        
		me.callParent(arguments);
    },
    
    getErrors: function(value)  {
        var me = this,
            errors = me.callParent(arguments);
		
		if(me.maxChars)
		{
			if(me.getIntegerValue().length > me.maxChars){
				errors.push(Ext.String.format(me.maxLengthText, me.maxChars));
			}
		}
		
		return errors;
	},
	
	onRender: function() {
		var me = this;
		
		me.callParent(arguments);
		
		me.inputEl.setStyle({
            		textAlign: 'right'
        	});
		
		me.hiddenName = me.hiddenName||me.name; 
		
		if(me.hiddenName)
		{
            me.hiddenField = me.el.insertSibling({
				tag	: 'input', 
				type: 'hidden', 
				name: me.hiddenName
			}, 'before', true);

            me.el.dom.removeAttribute('name');
            me.mon(me.el, 'keyup', me.onElKeyUp, me);
        }
	},
	
	onEnable : function() {
        this.callParent(arguments);
        if(this.hiddenField){
            this.hiddenField.disabled = false;
        }
    },

    onDisable : function() {
        this.callParent(arguments);
        if(this.hiddenField){
            this.hiddenField.disabled = true;
        }
    },
	
    getName: function() {
        var hf = this.hiddenField;
        return hf && hf.name ? hf.name : this.hiddenName || this.callParent(arguments);
    },
	
	clearValue : function() {
        if(this.hiddenField){
            this.hiddenField.value = '';
        }
		
		delete this.value;
		
		this.callParent(arguments);
    },
	
    initValue : function() {
        this.callParent(arguments);
		
        if(this.hiddenField){
            this.hiddenField.value = this.getValue();
        }
    },
	
//listeners

	onElKeyUp: function() {
		if(this.hiddenField){
            this.hiddenField.value = this.getValue();
        }
	},
	
//other methods
	
	/**
	 * Format values like:
	 * 10       -> 10,00
	 * 10.20    -> 10,20
	 * 145222	-> 145.22
	 * 23452.1	-> 23.452,10
	 */
	formatField: function(v) {
		//remove garbage
		v = v.replace(this.stripCharsRe, '');
		
		//remove centsimal separators
		var centesimalSeparator = this.decimalSeparator === ',' ? '.' : ',';
		v = v.replace(new RegExp(Ext.escapeRe(centesimalSeparator),'gi'),'');
		
		//define integer and decimal parts
		v = v.split(this.decimalSeparator);
		var partInt = v[0]||'0',
			partDec = v[1]||'';
			
		//fill with zeros	
		if(this.allowDecimals)
		{
			while(partDec.length < this.decimalPrecision){
				partDec += '0';
			}
			
			if(partDec.length > this.decimalPrecision){
				partDec = partDec.substr(0,this.decimalPrecision);
			}
		}
		
		//remove left zeros on integer part
		partInt = partInt.split('');
		while(partInt.length && partInt[0] === '0')
		{
			partInt.shift();
		}
		partInt = partInt.join('')||'0';
		
		//format centesimal separator
		partInt = partInt.split('');
		var i = partInt.length;
        while((i -= 3) > 0)
        { 
			partInt[i - 1] += centesimalSeparator; 
        }
			
		//join sign, decimal and integer parts
		v = this.sign + partInt.join('') + (this.allowDecimals ? this.decimalSeparator + partDec : '');
		
		//return	
		return v;
	},
	
	formatNumber: function(v, returnNumber) {
		var	commaReg;
		v = v||0;
		
		if(Ext.isString(v))
		{
			//remove garbage
			v = v.replace(this.stripCharsRe, '');
			
			//format if it is not already formated (no commas and only one dot)
			var matchDot = v.match(/\./g);
			
			if(v.match(/,/g) || (matchDot && matchDot.length > 1))
			{
				//remove centsimal separators
				var centesimalSeparator = this.decimalSeparator === ',' ? '.' : ',';
				v = v.replace(new RegExp(Ext.escapeRe(centesimalSeparator),'gi'),'');
			
				//define integer and decimal parts
				v = v.split(this.decimalSeparator);
				var partInt = v[0]||'0',
					partDec = v[1]||'';
					
				//fill with zeros	
				if(this.allowDecimals)
				{
					while(partDec.length < this.decimalPrecision){
						partDec += '0';
					}
					
					if(partDec.length > this.decimalPrecision){
						partDec = partDec.substr(0,this.decimalPrecision);
					}
				}
				
				//remove left zeros on integer part
				partInt = partInt.split('');
				while(partInt.length && partInt[0] === '0')
				{
					partInt.shift();
				}
				partInt = partInt.join('')||'0';
				
				//join sign, decimal and integer parts
				v = this.sign + partInt + (this.allowDecimals ? '.' + partDec : '');
			}
				
			//parse float
			v = parseFloat(v,10);
		}
		
		if(!this.allowDecimals){
			v = parseInt(v,10)||0;
		}
		
		v = v||0;
		return returnNumber ? v : this.allowDecimals ? v.toFixed(this.decimalPrecision) : v + '';
	},
	
	getIntegerValue: function() {
		return this.formatNumber(this.getRawValue()).split('.')[0];
	},
	
	getDecimalValue: function() {
		return this.formatNumber(this.getRawValue()).split('.')[1];
	}
});
