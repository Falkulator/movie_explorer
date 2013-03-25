
MOVIEXP.Progress = function () {
	this.percent = 0;
	this.timeout = 15000;
	this.interval;
}

/**
 *hides progress bar and error
 */
MOVIEXP.Progress.prototype.hide = function () {
	$('.alert').css("display", "none");
    $('.progress').css("visibility", "hidden");
    $('.bar').css("width", '0%');
    this.stop();
}

/**
 *Shows error message
 */
MOVIEXP.Progress.prototype.error = function () {
	$('.alert').css("display", "inline-block");
    $('.progress').css("visibility", "hidden");
    this.stop();
}

/**
 *Starts the progress
 */
MOVIEXP.Progress.prototype.start = function () {
	var x = this.timeout / 100,
		that = this;
	$('.progress').css("visibility", "visible");
    

    this.interval = setInterval(function () {
      console.log(that.percent);
      $('.bar').css("width", that.percent + '%');
      that.percent += 1;
      if (that.percent > 100) {
        that.stop();
        $('.bar').css("width", '0%');
      }
    }, x);
}

/**
 *Stops the interval
 */
 MOVIEXP.Progress.prototype.stop = function () {
 	clearInterval(this.interval);
 }