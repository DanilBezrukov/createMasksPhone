function createMasksPhone() {
            
    function isNumber ( value ) {
        return !isNaN( +value ) && value !== " "
    }

    function getTemplateAtStartup( value ) {
        if ( /[ 1-6, 9 ]/.test( +value ) ) {
            return `+7 (${ value }__) ___-__-__`
        } else {
            return '+7 (___) ___-__-__'
        }
    }
    
    function getUpdatedRow( currentCharacter ) {
        const mask = Array.from( this.value )
        const validation = isNumber( mask[ this.selectionStart ] ) || mask[ this.selectionStart ] === '_'
        if ( validation && currentCharacter ) {
            mask.splice( this.selectionStart, 1, currentCharacter )
        }
        return mask.join( "" )
    }

    function setCursorPosition ( startPos ) {
        const start = typeof startPos === "number" ? startPos : 0
        const position = this.value.indexOf( '_', start )
        this.selectionStart = position > 0 ? position : this.value.length
        this.selectionEnd = this.selectionStart
    }

    function navCursorWithArrows( entry ) {
        switch ( entry ) {
            case "ArrowLeft":
                this.selectionStart--
                break
            case "ArrowRight":
                this.selectionStart++
                break
        }
        this.selectionEnd = this.selectionStart
    }

    function removingNumberFromString() {
        let selection = this.selectionStart
        let formClearingFlag
        for ( let i = this.value.length - ( this.value.length - ( selection - 1 ) ); i >= 0; i-- ) {
            if ( isNumber( this.value[i] ) ) {
                const mask = Array.from( this.value )
                mask.splice( i, 1, "_" )
                this.value = mask.join( "" )
                this.selectionStart = i
                break
            }
        }
        for ( i of this.value ) {
            if ( isNumber( i ) ) {
                formClearingFlag = false
                break
            }
            formClearingFlag = true
        }
        if ( formClearingFlag ) this.value = ''
    }

    function createMask( event ) {
        const entry = event.key
        const currentCharacter = isNumber( entry ) && entry
        const inputValue = this.value || currentCharacter || "+"
        if ( isNumber( entry ) || entry === "+" ) {
            if ( inputValue.length === 1 ) {
                this.value = getTemplateAtStartup( inputValue )
                setCursorPosition.call( this )
            } else {
                const currentСursorPosition = this.selectionStart
                this.value = getUpdatedRow.call( this, currentCharacter )
                setCursorPosition.call( this, currentСursorPosition )
            }
        } else if ( entry === "Backspace" ) {
            removingNumberFromString.call( this )
        }
        navCursorWithArrows.call( this, entry ) 
        event.preventDefault();
    }

    return function ( node ){
        const nodes = node ? [ node ] : document.querySelectorAll( "input[type='tel']" )
        nodes.forEach( elem => {
            elem.addEventListener( 'keydown', createMask )
            elem.addEventListener( 'focus', setCursorPosition )
        })
    }
}