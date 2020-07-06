import test from 'ava' ;

import { Measures } from '@aureooms/js-measure' ;
import { gt } from '@aureooms/js-predicate' ;
import { list, range } from '@aureooms/js-itertools' ;
import { empty } from '@aureooms/js-fingertree' ;
import { seq } from '../../src' ;

const Seq = seq( empty , Measures.SIZE ) ;

test( 'seq' , t => {

	let s = Seq.empty( ) ;

	t.true( s.empty( ) ) ;

	t.is( s.len( ) , 0 ) ;

	s = s.push( 'b' ) ;
	s = s.push( 'c' ) ;
	s = s.cons( 'a' ) ;

	t.true( !s.empty( ) ) ;

	t.is( s.len( ) , 3 ) ;

	t.is( s.head( ) , 'a' ) ;
	t.deepEqual( list( s.tail( ) ) , list( 'bc' ) ) ;

	t.is( s.last( ) , 'c' ) ;
	t.deepEqual( list( s.init( ) ) , list( 'ab' ) ) ;

	t.is( s.get( 0 ) , 'a' ) ;
	t.is( s.get( 1 ) , 'b' ) ;
	t.is( s.get( 2 ) , 'c' ) ;

	let _t = s.set( 1 , 'B' ) ;

	t.is( s.get( 0 ) , 'a' ) ;
	t.is( s.get( 1 ) , 'b' ) ;
	t.is( s.get( 2 ) , 'c' ) ;

	t.is( _t.get( 0 ) , 'a' ) ;
	t.is( _t.get( 1 ) , 'B' ) ;
	t.is( _t.get( 2 ) , 'c' ) ;

	s = s.append( 'def' ) ;
	s = s.prepend( '?.!' ) ;

	t.deepEqual( list( s ) , list( '?.!abcdef' ) ) ;
	t.deepEqual( list( s.concat( _t ) ) , list( '?.!abcdefaBc' ) ) ;

	let split = s.splitAt( 4 ) ;
	t.deepEqual( list( split[0] ) , list( '?.!a' ) ) ;
	t.deepEqual( list( split[1] ) , list( 'bcdef' ) ) ;
	t.deepEqual( list( s.takeUntil( gt( 4 ) ) ) , list( '?.!a' ) ) ;
	t.deepEqual( list( s.dropUntil( gt( 4 ) ) ) , list( 'bcdef' ) ) ;

	t.deepEqual( list( Seq.from( 'abcd' ) ) , list( 'abcd' ) ) ;

	t.throws( s.get.bind( s , -1 ) , { message: /index/ } ) ;
	t.throws( s.get.bind( s , list( s ).length ) , { message: /index/ } ) ;

	t.throws( s.set.bind( s , -1 , 'Z' ) , { message: /index/ } ) ;
	t.throws( s.set.bind( s , list( s ).length , 'Z' ) , { message: /index/ } ) ;

} ) ;

test('@aureooms/js-fingertree github issue #73', t => {
	let s = Seq.from('abcde');

	for (const x of range(26)) {
		const c = String.fromCharCode( 87 + x );
		s = s.set(2, c);
		t.deepEqual(list(s), list('ab'+c+'de'));
	}
}) ;

test('Seq#slice', t => {

	const s = Seq.from('abcde');
	t.deepEqual(list('abcde'), list(s.slice(0,5)));
	t.deepEqual(list('abcd'), list(s.slice(0,4)));
	t.deepEqual(list('bcde'), list(s.slice(1,5)));
	t.deepEqual(list('bcd'), list(s.slice(1,4)));
	t.deepEqual(list('cde'), list(s.slice(2,5)));

}) ;

// Examples from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice
test('Seq#slice (MDN Return a portion of an existing array)', t => {
	const fruits = Seq.from(['Banana', 'Orange', 'Lemon', 'Apple', 'Mango']);
	const citrus = fruits.slice(1, 3);

	t.deepEqual(['Banana', 'Orange', 'Lemon', 'Apple', 'Mango'], list(fruits));
	t.deepEqual(['Orange', 'Lemon'], list(citrus));
});

test('Seq#slice (MDN Using slice)', t => {

	const myHonda = { color: 'red', wheels: 4, engine: { cylinders: 4, size: 2.2 } }
	const myCar = Seq.from([myHonda, 2, 'cherry condition', 'purchased 1997']);
	const newCar = myCar.slice(0, 2)

	t.deepEqual([myHonda, 2, 'cherry condition', 'purchased 1997'], list(myCar));
	t.deepEqual([myHonda, 2], list(newCar));

	t.is('red', myCar.get(0).color);
	t.is('red', newCar.get(0).color);

	myCar.get(0).color = 'purple';
	t.is('purple', myCar.get(0).color);
	t.is('purple', newCar.get(0).color);

	newCar.get(0).color = 'green';
	t.is('green', myCar.get(0).color);
	t.is('green', newCar.get(0).color);

});

test('Seq#remove', t => {

	const string = 'abcde' ;
	const s = Seq.from(string);
	for (const i of range(0, string.length)) {
		const result = s.remove(i);
		t.deepEqual(list(string.slice(0,i)+string.slice(i+1)), list(result));
	}

}) ;

test('Seq#insert', t => {

	const string = 'abcde' ;
	const s = Seq.from(string);

	for (const i of range(0, string.length)) {
		const result = s.insert(i, string[i].toUpperCase());
		t.deepEqual(list(string.slice(0,i)+string[i].toUpperCase()+string.slice(i)), list(result));
	}

}) ;

test('Seq#splice', t => {

	const string = 'abcde' ;
	const s = Seq.from(string);
	for (const i of range(-string.length, string.length)) {
		const [result, removed] = s.splice(i,1);
		const _i = i < 0 ? i + string.length : i;
		t.deepEqual(list(string.slice(0,_i)+string.slice(_i+1)), list(result));
		t.deepEqual(list(string[_i]), list(removed));
	}

	for (const i of range(0, string.length)) {
		const [result, removed] = s.splice(i,1, ...string.slice(0,i+1).toUpperCase());
		t.deepEqual(list(string.slice(0,i)+string.slice(0,i+1).toUpperCase()+string.slice(i+1)), list(result));
		t.deepEqual(list(string[i]), list(removed));
	}

	for (const i of range(0, string.length)) {
		const [result, removed] = s.splice(i,0, ...string.slice(0,i+1).toUpperCase());
		t.deepEqual(list(string.slice(0,i)+string.slice(0,i+1).toUpperCase()+string.slice(i)), list(result));
		t.deepEqual([], list(removed));
	}

	for (const i of range(0, string.length)) {
		const [result, removed] = s.splice(i,undefined, ...string.slice(0,i+1).toUpperCase());
		t.deepEqual(list(string.slice(0,i)+string.slice(0,i+1).toUpperCase()), list(result));
		t.deepEqual(list(string.slice(i)), list(removed));
	}

}) ;

// Examples from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
test('Seq#splice (MDN Remove 0 (zero) elements before index 2, and insert "drum")', t => {
	const myFish = Seq.from(['angel', 'clown', 'mandarin', 'sturgeon']);
	const [result, removed] = myFish.splice(2, 0, 'drum');

	t.deepEqual(['angel', 'clown', 'mandarin', 'sturgeon'], list(myFish));
	t.deepEqual(["angel", "clown", "drum", "mandarin", "sturgeon"], list(result));
	t.deepEqual([], list(removed));
}) ;

test('Seq#splice (MDN Remove 0 (zero) elements before index 2, and insert "drum" and "guitar")', t => {
	const myFish = Seq.from(['angel', 'clown', 'mandarin', 'sturgeon']);
	const [result, removed] = myFish.splice(2, 0, 'drum', 'guitar');

	t.deepEqual(['angel', 'clown', 'mandarin', 'sturgeon'], list(myFish));
	t.deepEqual(["angel", "clown", "drum", "guitar", "mandarin", "sturgeon"], list(result));
	t.deepEqual([], list(removed));
}) ;

test('Seq#splice (MDN Remove 1 element at index 3)', t => {
	const myFish = Seq.from(['angel', 'clown', 'drum', 'mandarin', 'sturgeon']);
	const [result, removed] = myFish.splice(3, 1);

	t.deepEqual(['angel', 'clown', 'drum', 'mandarin', 'sturgeon'], list(myFish));
	t.deepEqual(["angel", "clown", "drum", "sturgeon"], list(result));
	t.deepEqual(["mandarin"], list(removed));
}) ;

test('Seq#splice (MDN Remove 1 element at index 2, and insert "trumpet")', t => {
	const myFish = Seq.from(['angel', 'clown', 'drum', 'sturgeon']);
	const [result, removed] = myFish.splice(2, 1, 'trumpet');

	t.deepEqual(['angel', 'clown', 'drum', 'sturgeon'], list(myFish));
	t.deepEqual(["angel", "clown", "trumpet", "sturgeon"], list(result));
	t.deepEqual(["drum"], list(removed));
}) ;

test('Seq#splice (MDN Remove 2 elements from index 0, and insert "parrot", "anemone" and "blue")', t => {
	const myFish = Seq.from(['angel', 'clown', 'trumpet', 'sturgeon']);
	const [result, removed] = myFish.splice(0, 2, 'parrot', 'anemone', 'blue');

	t.deepEqual(['angel', 'clown', 'trumpet', 'sturgeon'], list(myFish));
	t.deepEqual(["parrot", "anemone", "blue", "trumpet", "sturgeon"], list(result));
	t.deepEqual(["angel", "clown"], list(removed));
}) ;

test('Seq#splice (MDN Remove 2 elements from index 2)', t => {
	const myFish = Seq.from(['parrot', 'anemone', 'blue', 'trumpet', 'sturgeon']);
	const [result, removed] = myFish.splice(2, 2);

	t.deepEqual(['parrot', 'anemone', 'blue', 'trumpet', 'sturgeon'], list(myFish));
	t.deepEqual(["parrot", "anemone", "sturgeon"], list(result));
	t.deepEqual(["blue", "trumpet"], list(removed));
}) ;

test('Seq#splice (MDN Remove 1 element from index -2)', t => {
	const myFish = Seq.from(['angel', 'clown', 'mandarin', 'sturgeon']);
	const [result, removed] = myFish.splice(-2, 1);

	t.deepEqual(['angel', 'clown', 'mandarin', 'sturgeon'], list(myFish));
	t.deepEqual(["angel", "clown", "sturgeon"], list(result));
	t.deepEqual(["mandarin"], list(removed));
}) ;

test('Seq#splice (MDN Remove all elements after index 2 (incl.))', t => {
	const myFish = Seq.from(['angel', 'clown', 'mandarin', 'sturgeon']);
	const [result, removed] = myFish.splice(2);

	t.deepEqual(['angel', 'clown', 'mandarin', 'sturgeon'], list(myFish));
	t.deepEqual(["angel", "clown"], list(result));
	t.deepEqual(["mandarin", "sturgeon"], list(removed));
}) ;
