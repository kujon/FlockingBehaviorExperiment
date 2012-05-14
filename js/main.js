/**
 * Author: Jakub Korzeniowski
 * Agency: Softhis
 * http://www.softhis.com
 */
 "use strict";
(function($){

	var

	//Boid prototype
	Boid = function(x, y, vx, vy) {
		this.pos = $V([x, y]);
		this.vel = $V([vx, vy]);

		this.color = '#' + (function(h){return new Array(7-h.length).join("0")+h})((Math.random()*0x1000000<<0).toString(16));

		this.separationFactor = 12;
		this.aligmentFactor = 1/80;
		this.cohesionFactor = 1/50;
		this.tendToPlaceFactor = 1/50;
		this.velLimit = 15;
		this.boundPosFactor = 10;
	};
	Boid.prototype = {
		separation: function(boids, index) {
			var _c = $V([0, 0]);
			for(var _i = 0, _l = boids.length; _i < _l; _i++) {
				var _b = boids[_i];
				if(_i !== index) {
					if(this.pos.distanceFrom(_b.pos) < this.separationFactor) {
						_c = _c.subtract(_b.pos.subtract(this.pos));
					}
				}
			}
			return _c;
		},
		aligment: function(boids, index) {
			var _c = $V([0, 0]);
			for(var _i = 0, _l = boids.length; _i < _l; _i++) {
				var _b = boids[_i];
				if(_i !== index) {
					_c = _c.add(_b.vel);
				}
			}
			_c = _c.multiply(1/(_l - 1));

			return _c.subtract(this.vel).multiply(this.aligmentFactor);
		},
		cohesion: function(boids, index) {
			var _c = $V([0, 0]);
			for(var _i = 0, _l = boids.length; _i < _l; _i++) {
				var _b = boids[_i];
				if(_i !== index) {
					_c = _c.add(_b.pos);
				}
			}
			_c = _c.multiply(1/(_l - 1));

			return _c.subtract(this.pos).multiply(this.cohesionFactor);
		},
		tendToPlace: function(place) {
			return place.subtract(this.pos).multiply(this.tendToPlaceFactor);
		},
		limitVel: function() {
			if(this.vel.modulus() > this.velLimit) {
				this.vel = this.vel.toUnitVector().multiply(this.velLimit);
			}
		},
		boundPos: function(minX, maxX, minY, maxY) {
			if(this.pos.elements[0] < minX) {
				this.vel.elements[0] = this.boundPosFactor;
			} else if(this.pos.elements[0] > maxX) {
				this.vel.elements[0] = -this.boundPosFactor;
			}
			if(this.pos.elements[1] < minY) {
				this.vel.elements[1] = this.boundPosFactor;
			} else if(this.pos.elements[1] > maxY) {
				this.vel.elements[1] = -this.boundPosFactor;
			}
		}
	};

	var

	canvas,
	ctx,

	$fps,

	Lab = (function(){

		var

		_canvas,
		_ctx,

		_lastTime,
		_dt,

		_width,
		_height,
		_widthHalf,
		_heightHalf,
		_mX = 0,
		_mY = 0,

		_boids,

		//Initializes the app
		_init = function(canvas, ctx) {
			_canvas = canvas;
			_ctx = ctx;

			_updateSize();

			_createBoids(100);

			_update();
		},

		//called each frame
		_update = function(time) {

			_dt = time - _lastTime;
			_lastTime = time;

			$fps.text(Math.round(1000/_dt));

			//logic goes here
			_updateBoids();

			//draws
			_ctx.clearRect(0, 0, _width, _height);
			_drawBackground();
			_drawBoids();

			//request next frame
			window.requestAnimationFrame(_update);
		},

		_updateSize = function() {
			_width = window.innerWidth;
			_height = window.innerHeight;
			_widthHalf = _width / 2;
			_heightHalf = _height / 2;

			_ctx.canvas.width = _width;
			_ctx.canvas.height = _height;
		},

		_updateMousePosition = function(event) {
			_mX = event.clientX;
			_mY = event.clientY;
		},

		_drawBackground = function() {
			_ctx.fillStyle = 'rgb(0, 0, 0)';
			_ctx.fillRect(0, 0, _width, _height);
		},

		_updateBoids = function() {
			var _attractionVector = $V([_mX, _mY]);
			for(var _i = 0, _l = _boids.length; _i < _l; _i++) {
				var _b = _boids[_i],
					_s = _b.separation(_boids, _i),
					_a = _b.aligment(_boids, _i),
					_c = _b.aligment(_boids, _i),
					_t = _b.tendToPlace(_attractionVector),
					_pos;
				_b.vel = _b.vel.add(_s);
				_b.vel = _b.vel.add(_a);
				_b.vel = _b.vel.add(_c);
				_b.vel = _b.vel.add(_t);
				_b.boundPos(0, _width/2, 0, _height/2);
				_b.limitVel();
				_b.pos = _pos =_b.pos.add(_b.vel);

				/*if(_pos.elements[0] < 0) {
					_b.pos.elements[0] = _width + _pos.elements[0];
				} else if(_pos.elements[0] > _width) {
					_b.pos.elements[0] = _pos.elements[0] - _width;
				}

				if(_pos.elements[1] < 0) {
					_b.pos.elements[1] = _height + _pos.elements[1];
				} else if(_pos.elements[1] > _height) {
					_b.pos.elements[1] = _pos.elements[1] - _height;
				}*/
			}
		},

		_drawBoids = function() {

			for(var _i = 0, _l = _boids.length; _i < _l; _i++) {
				var _b = _boids[_i],
					_pos = _b.pos;
				_ctx.fillStyle = _b.color;
				_ctx.beginPath();
				_ctx.arc(_pos.elements[0], _pos.elements[1], 5, 0, Math.PI * 2, false);
				_ctx.closePath();
				_ctx.fill();
			}
		},

		_createBoids = function(amount) {
			
			_boids = [];
			for(var _i = 0; _i < amount; _i++) {
				_boids[_i] = new Boid(Math.random() * _width/2, Math.random() * _height/2, 0, 0);
			}

		},

		//Public interface
		_interface = {
			init: _init,
			updateSize: _updateSize,
			updateMousePosition: _updateMousePosition
		};

		return _interface;

	})();

	$(function(){

		var canvas = document.getElementById('lab'),
			ctx = canvas.getContext('2d');

		$fps = $('.fps');

		Lab.init(canvas, ctx);

		$(window).bind('resize', Lab.updateSize);
		$(document).bind('mousemove', Lab.updateMousePosition)

	});

})(jQuery);