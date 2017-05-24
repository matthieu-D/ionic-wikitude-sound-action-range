class Marker {

  constructor (poiData) {
    this.poiData = poiData;

    this.RESIZE_DURATION = 2000;

    this.animationIncreaseGroup = null;
    this.animationDecreaseGroup = null;

    this.DANGER_RADIUS = 5;

    this.alarm = new AR.Sound("http://soundbible.com/mp3/BOMB_SIREN-BOMB_SIREN-247265934.mp3", {
      onLoaded : () => {
        AR.logger.debug('sound loaded');
      },
      onError : () => {
        AR.logger.debug('sound not loaded');
      },
    });

    this.alarm.load();

    this.markerLocation = new AR.GeoLocation(poiData.latitude, poiData.longitude, poiData.altitude);

    var actionRange = new AR.ActionRange(this.markerLocation, this.DANGER_RADIUS, {
      onEnter : () => {
        AR.logger.debug('entered danger zone')
        this.alarm.play(-1);
      },
      onExit : () => {
        if (this.alarm.state === AR.CONST.STATE.PLAYING) {
          this.alarm.stop();
        }
      }
    });

    this.markerDrawable = new AR.ImageDrawable(World.markerDrawableIdle, 2.5, {
        zOrder: 0
    });

    this.descriptionLabel = new AR.Label(poiData.shortDescription, 1, {
        zOrder: 1,
        translate: {
            y: -0.55
        },
        style: {
            textColor: '#FFFFFF',
            fontStyle: AR.CONST.FONT_STYLE.BOLD
        }
    });

    this.directionIndicatorDrawable = new AR.ImageDrawable(World.markerDrawableDirectionIndicator, 0.1, {
        verticalAnchor: AR.CONST.VERTICAL_ANCHOR.TOP
    });

    this.markerObject = new AR.GeoObject(this.markerLocation, {
        drawables: {
            cam: [this.markerDrawable, this.descriptionLabel],
            indicator: this.directionIndicatorDrawable
        }
    });
    this.initAnimations();
  }

  updateDistance() {
    this.descriptionLabel.text = "Danger " + Math.round(this.markerObject.locations[0].distanceToUser()) + " m";
  }

  initAnimations () {
    var drawableResizeIncreaseAnimationX = new AR.PropertyAnimation(this.markerDrawable, 'scale.x', null, 3,
     this.RESIZE_DURATION, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.LINEAR));

    var drawableResizeIncreaseAnimationY = new AR.PropertyAnimation(this.markerDrawable, 'scale.y', null, 3,
     this.RESIZE_DURATION, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.LINEAR));

    var drawableResizeDecreaseAnimationX = new AR.PropertyAnimation(this.markerDrawable, 'scale.x', null, 1,
     this.RESIZE_DURATION, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.LINEAR));

    var drawableResizeDecreaseAnimationY = new AR.PropertyAnimation(this.markerDrawable, 'scale.y', null, 1,
     this.RESIZE_DURATION, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.LINEAR));

    this.animationDecreaseGroup = new AR.AnimationGroup(AR.CONST.ANIMATION_GROUP_TYPE.PARALLEL, [
      drawableResizeDecreaseAnimationX,
      drawableResizeDecreaseAnimationY], {
        onFinish: () => {
          this.animationIncreaseGroup.start()
        }
      });

    this.animationIncreaseGroup = new AR.AnimationGroup(AR.CONST.ANIMATION_GROUP_TYPE.PARALLEL, [
      drawableResizeIncreaseAnimationX,
      drawableResizeIncreaseAnimationY,
      ], {
        onFinish: () => {
          this.animationDecreaseGroup.start()
        }
      });
    this.animationIncreaseGroup.start();
  }
}
