/**
 * Author: Jakub Korzeniowski
 * Agency: Softhis
 * http://www.softhis.com
 */
(function($){

	"use strict";

	var

	//Boid prototype
	Boid = function(x, y, vx, vy, hue) {
		this.pos = $V([x, y]);
		this.vel = $V([vx, vy]);

		this.color = hsl2rgb(hue + random() * 8 - 4, random() * 50 + 50, random() * 50 + 30);
		//this.colorHex = '#' + this.color.r.toString(16) + this.color.g.toString(16) + this.color.b.toString(16);
		var alpha = random() * 0.5 + 0.5;
		alpha = round(alpha * 10) / 10;
		this.colorHex = 'rgba(' + this.color.r + ',' + this.color.g + ',' + this.color.b + ',' + alpha + ')';

		this.separationDistance = 12;
		this.separationFactor = 0.2;
		this.aligmentFactor = 1/80;
		this.cohesionFactor = 1/50;
		this.tendToPlaceFactor = 1/50;
		this.windVector = $V([1, 0.5]);
		this.velLimit = random() * 4 + 6;//random() * 15 + 3;
		this.boundPosFactor = 10;
	};
	Boid.prototype = {
		separation: function(boids, index, _l) {
			var _c = nullVector(2), _i, _b;
			for(_i = 0; _i < _l; _i++) {
				_b = boids[_i];
				if(_i !== index) {
					if(this.pos.distanceFrom(_b.pos) < this.separationDistance) {
						_c = _c.subtract(_b.pos.subtract(this.pos).multiply(this.separationFactor));
					}
				}
			}
			return _c;
		},
		aligment: function(_sumVel, _avgMultiplier) {
			return _sumVel.subtract(this.vel).multiply(_avgMultiplier).subtract(this.vel).multiply(this.aligmentFactor);
		},
		cohesion: function(_sumPos, _avgMultiplier) {
			return _sumPos.subtract(this.pos).multiply(_avgMultiplier).subtract(this.pos).multiply(this.cohesionFactor);
		},
		tendToPlace: function(place) {
			return place.subtract(this.pos).multiply(this.tendToPlaceFactor);
		},
		wind: function() {
			return this.windVector;
		},
		limitVel: function() {
			if(this.vel.modulus() > this.velLimit) {
				this.vel = this.vel.toUnitVector().multiply(this.velLimit);
			}
		},
		boundPos: function(minX, maxX, minY, maxY) {
			if(this.pos.elements[0] < minX && sgn(this.vel.elements[0]) !== 1) {
				this.vel.elements[0] = this.boundPosFactor;
			} else if(this.pos.elements[0] > maxX && sgn(this.vel.elements[0]) !== -1) {
				this.vel.elements[0] = -this.boundPosFactor;
			}
			if(this.pos.elements[1] < minY && sgn(this.vel.elements[1]) !== 1) {
				this.vel.elements[1] = this.boundPosFactor;
			} else if(this.pos.elements[1] > maxY && sgn(this.vel.elements[1]) !== -1) {
				this.vel.elements[1] = -this.boundPosFactor;
			}
		}
	};

	var

	//Herd prototype
	Herd = function(minX, maxX, minY, maxY, attract, predator) {
		this.boids = [];
		this.count = 0;
		this.baseHue = random() * 360;

		this.attractionPoint = attract;
		this.phi = random() * PI * 2;
		this.attractionRadiusX = random() * 800 + 200;
		this.attractionRadiusY = random() * 800 + 200;
		this.attractionPointSpeed = random() * 0.00025 + 0.00012;

		this.bounds = {
			minX: minX,
			maxX: maxX, 
			minY: minY,
			maxY: maxY
		};

		this.predator = predator;
		this.predatorThreshold = 300;
		this.predatorFactor = -10;
	};
	Herd.prototype = {
		createBoids: function(amount, minSpreadX, maxSpreadX, minSpreadY, maxSpreadY) {
			for(var _i = 0; _i < amount; _i++) {
				this.boids[_i] = new Boid(random() * (maxSpreadX - minSpreadX) + minSpreadX, random() * (maxSpreadY - minSpreadY) + minSpreadY, 0, 0, this.baseHue);
			}
			this.count = amount;
		},
		updateBoids: function(dt, time) {
			for(var _i = 0, _l = this.count, _avgMultiplier = 1/(_l - 1), _sumPos = nullVector(2), _sumVel = nullVector(2), _b; _i < _l; _i++) {
				_b = this.boids[_i];
				_sumPos = _sumPos.add(_b.pos);
				_sumVel = _sumVel.add(_b.vel);
			}

			for(_i = 0; _i < _l; _i++) {
				_b = this.boids[_i];
				var	_prevPos = _b.pos,
					_prevVel = _b.vel,
					_s = _b.separation(this.boids, _i, _l),
					_a = _b.aligment(_sumVel, _avgMultiplier),
					_c = _b.cohesion(_sumPos, _avgMultiplier),
					_t = _b.tendToPlace(this.getAttractionCoordinates(time)),
					_w = _b.wind(),
					_p = _b.pos.distanceFrom(this.predator) < this.predatorThreshold ? _b.tendToPlace(this.predator).multiply(this.predatorFactor) : nullVector(2),
					_pos;
				_b.vel = _b.vel.add(_s);
				_b.vel = _b.vel.add(_a);
				_b.vel = _b.vel.add(_c);
				_b.vel = _b.vel.add(_t);
				_b.vel = _b.vel.add(_w);
				_b.vel = _b.vel.add(_p);
				//_b.boundPos(this.bounds.minX, this.bounds.maxX, this.bounds.minY, this.bounds.maxY);
				_b.limitVel();
				_b.pos = _pos =_b.pos.add(_b.vel);

				_sumPos = _sumPos.subtract(_prevPos).add(_b.pos);
				_sumVel = _sumVel.subtract(_prevVel).add(_b.vel);
			}
		},
		drawBoids: function(ctx) {
			for(var _i = 0, _l = this.count, _b; _i < _l; _i++) {
				_b = this.boids[_i];
				var _pos = _b.pos;
				ctx.fillStyle = _b.colorHex;
				ctx.beginPath();
				ctx.arc(_pos.elements[0], _pos.elements[1], 5, 0, PI * 2, false);
				ctx.closePath();
				ctx.fill();
			}
		},
		getAttractionCoordinates: function(time) {
			var x = this.attractionRadiusX * sin(this.attractionPointSpeed * time + this.phi) + this.attractionPoint.elements[0],
				y = this.attractionRadiusY * cos(this.attractionPointSpeed * time + this.phi) + this.attractionPoint.elements[1];
			return $V([x, y]);
		}
	};

	var

	canvas,
	ctx,

	$fps,

	random = Math.random,
	round = Math.round,
	sin = Math.sin,
	cos = Math.cos,
	PI = Math.PI,
	TWO_PI = PI * 2,

	nullVector = Vector.Zero,

	Lab = (function(){

		var

		_bufferCanvas,
		_bufferContext,
		_canvas,
		_ctx,

		_lastTime,
		_dt,

		_width,
		_height,
		_widthHalf,
		_heightHalf,
		_predator = nullVector(2),

		//_boids,
		_herds,
		_herdsCount,

		//Initializes the app
		_init = function(canvas, ctx) {
			_canvas = canvas;
			_ctx = ctx;

			_bufferCanvas = document.createElement('canvas');
			_bufferContext = _bufferCanvas.getContext('2d');

			_updateSize();

			_createBoids(40, 50);

			_update(_lastTime = (new Date()).getTime());
		},

		//called each frame
		_update = function(time) {

			_dt = time - _lastTime;
			_lastTime = time;

			$fps.text(round(1000/_dt));

			//logic goes here
			_updateBoids(time);

			//draws
			_bufferContext.clearRect(0, 0, _width, _height);
			_drawBackground();
			_drawBoids();

			//copy results from bufferCanvas to visible Canvas for performance reasons
			_ctx.drawImage(_bufferCanvas, 0, 0);

			//request next frame
			window.requestAnimationFrame(_update);
		},

		_updateSize = function() {
			_width = window.innerWidth;
			_height = window.innerHeight;
			_widthHalf = _width / 2;
			_heightHalf = _height / 2;

			_bufferContext.canvas.width = _ctx.canvas.width = _width;
			_bufferContext.canvas.height = _ctx.canvas.height = _height;
		
			if(_herds != null) {
				for(var _i = 0, _h; _i < _herdsCount; _i++) {
					_h = _herds[_i];
					_h.bounds.maxX = _width;
					_h.bounds.maxY = _height;
				}
			}
		},

		_updateMousePosition = function(event) {
			_predator.setElements([event.clientX, event.clientY]);

			for(var _i = 0, _h; _i < _herdsCount; _i++) {
				_h = _herds[_i];
				_h.predator = _predator;
			}
		},

		_drawBackground = function() {
			_bufferContext.fillStyle = 'rgb(0, 0, 0)';
			_bufferContext.fillRect(0, 0, _width, _height);
		},

		_updateBoids = function(time) {
			for(var _i = 0, _h; _i < _herdsCount; _i++) {
				_h = _herds[_i];
				_h.updateBoids(_dt, time);
			}
		},

		_drawBoids = function() {
			for(var _i = 0, _h; _i < _herdsCount; _i++) {
				_h = _herds[_i];
				_h.drawBoids(_bufferContext);
			}
		},

		_createBoids = function(herdsCount, boidsCount) {
			_herds = [];
			for(var _i = 0, _h, _rect; _i < herdsCount; _i++) {
				_h = new Herd(0, _width, 0, _height, $V([_width/2, _height/2/*random() * _width, random() * _height*/]), _predator);
				_rect = offScreenRect(_width, _height, random() * _width, random() * _height);
				_h.createBoids(boidsCount, _rect.minX, _rect.maxX, _rect.minY, _rect.maxY);
				_herds[_i] = _h;
			}
			_herdsCount = herdsCount;
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
		$(document).bind('mousemove', Lab.updateMousePosition);

	});

})(jQuery);