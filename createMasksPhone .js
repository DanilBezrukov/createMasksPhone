function initMasksPhone() {

    const handler = {
        get: function ( target, property ) {
            if (property === "maskedPhone") return getMaskedPhone( target.value );
            return target[ property ]
        },
        set: function ( target, property, value ) {
            if( property === 'value' ) {
                target[ property ] = getCleanPhone( value )
            } else {
                target[ property ] = value
            }
            
        },
    }

    const checkFirstNumber = firstNumber =>  [ 0, 7, 8 ].includes( +firstNumber )
    const myBackspace = value => value.slice(0, -1)

    function getCleanPhone ( value ) {
        let cleanPhone = value.replace(/\D/g, '')

        if( cleanPhone.length > 11 ) {
            cleanPhone = cleanPhone.slice(0, -1)
        }

        if( checkFirstNumber( cleanPhone[ 0 ] ) ){
            return cleanPhone.slice( 1 )
        }
        return cleanPhone
    }

    function getMaskedPhone(value = '') {
        let mask = Array.from("(___) ___-__-__")
        for ( let i in value ) {
            if (i == 0 && checkFirstNumber( value[ i ] ) ) continue
            const position = mask.indexOf('_')
            mask[ position ] = value[i]
        }
        return "+7 " + mask.join('')
    }

    function setCursorPosition() {
        const position = this.value.indexOf('_')
        this.selectionStart = position > 0 ? position : this.value.length
        this.selectionEnd = this.selectionStart
    }

    function resetFieldValue ( target ) {
        target.proxyTarget.resetFlag = false
        target.value = ''
    }

    function updateFieldValue() {
        if( !this.proxyTarget.resetFlag ) {
            this.value = this.proxyTarget.maskedPhone
            setCursorPosition.call(this)
            return
        }
        resetFieldValue( this )
    }

    function createMask() {
        this.proxyTarget.value = this.value
        updateFieldValue.call( this )
    }

    function keydownProhibition( event ) {
        const key = event.key
        const banList = [
            'Backspace',
            'ArrowLeft',
            'ArrowUp',
            'ArrowDown',
            'ArrowRight',
        ]

        if ( key === 'Backspace' ) {
            this.proxyTarget.value = myBackspace( this.proxyTarget.value )
            updateFieldValue.call( this )
            this.dispatchEvent( new Event('input') )
        }
        if ( banList.includes( key ) ) event.preventDefault()
    }

    function myBlur() {
        if (this.value === "+7 (___) ___-__-__") {
            this.proxyTarget.resetFlag = true
            this.dispatchEvent( new Event('input') )  
        }
    }

    function myFocus() {
        setTimeout( () => {
            updateFieldValue.call( this )
        } );
    }

    function myPaste ( event ) {
        this.value = event.clipboardData?.getData('text')
        this.dispatchEvent( new Event('input') ) 
        event.preventDefault()
    }

    function nodeSearch ( inputData ) {
        if ( typeof inputData === 'string') {
            return document.querySelectorAll( inputData )
        } else if ( inputData instanceof HTMLElement ) {
            return [ inputData ]
        } else if ( inputData instanceof NodeList ) {
            return inputData 
        }

        return document.querySelectorAll( "input[type='tel']" )
    }

    return function ( inputData ) {
        const elements = nodeSearch( inputData )
        for ( let i = 0; i < elements.length; i++ ) {
            const elem = elements[ i ];
            if( elem.proxyTarget ) continue

            elem.proxyTarget = new Proxy( {
                value: '',
                maskedPhone: '',
                resetFlag: false
            }, handler )
            elem.setAttribute("autocomplete", "tel");
            elem.removeAttribute('maxlength')
            elem.addEventListener('keydown', keydownProhibition, { capture: true })
            elem.addEventListener('input', createMask, { capture: true } )
            elem.addEventListener('focus', myFocus, { capture: true } )
            elem.addEventListener('click', setCursorPosition, { capture: true })
            elem.addEventListener('blur', myBlur, { capture : true } )
            elem.addEventListener('paste', myPaste )
        }
    }
}
