goog.provide('annotorious.shape.geom.Polygon');

/**
 * A polygon geometry primitive.
 * @param {Array.<annotorious.shape.geom.Point>} points the points
 * @constructor
 */
annotorious.shape.geom.Polygon = function(points) {
  this.points = points;
}

/** Polygon-specific helper functions & geometry computation utilities **/

/**
 * Computes the area of a polygon. Note that the area can be <0, depending on the
 * clockwise/counterclockwise orientation of a polygon.
 * @param {Array.<annotorious.shape.geom.Point>} points the points
 * @returns the area
 */
annotorious.shape.geom.Polygon.computeArea = function(points) {
    var area = 0.0;

    var j = points.length - 1;
    for (var i=0; i<points.length; i++) {
      area += (points[j].x + points[i].x) * (points[j].y -points[i].y); 
      j = i; 
    }

    return area / 2;  
}

/**
 * Tests whether a polygon is oriented in clockwise or counterclockwise
 * direction.
 * @param {Array.<annotorious.shape.geom.Point>} points the points
 * @returns {boolean} true if the geometry is in clockwise orientation
 */
annotorious.shape.geom.Polygon.isClockwise = function(points) {
  return annotorious.shape.geom.Polygon.computeArea(points) > 0;
}

/**
 * Computes the centroid coordinate for the specified polygon.
 * @param {Array.<annotorious.shape.geom.Point>} points the points
 * @returns {annotorious.shape.geom.Point} the centroid X/Y coordinate
 */
annotorious.shape.geom.Polygon.computeCentroid = function(points) {
  var x = 0;
  var y = 0;
  var f;
  var j = points.length - 1;

  for (var i=0; i<points.length; i++) {
    f = points[i].x * points[j].y - points[j].x * points[i].y;
    x += (points[i].x + points[j].x) * f;
    y += (points[i].y + points[j].y) * f;
    j = i;
  }

  f = annotorious.shape.geom.Polygon.computeArea(points) * 6;
  return { x: Math.abs(x/f), y: Math.abs(y/f) }; 
}

/**
 * A simple triangle expansion algorithm that shifts triangle vertices in/outwards by a specified
 * delta, along the axis centroid->vertex. Used internally as a subroutine for polygon expansion.
 * @param {Array.<annotorious.shape.geom.Point>} points the points
 * @returns {Array.<annotorious.shape.geom.Point>} the expanded triangle
 * @private
 */
annotorious.shape.geom.Polygon._expandTriangle = function(points, delta) {
  function shiftAlongAxis(px, centroid, delta) {
    var axis = { x: (px.x - centroid.x) , y: (px.y - centroid.y) };
    var sign_x = axis.x > 0 ? 1 : axis.x < 0 ? -1 : 0;
    var sign_y = axis.y > 0 ? 1 : axis.y < 0 ? -1 : 0;
  
    var dy = Math.sqrt(Math.pow(delta, 2) / (1 + Math.pow((axis.x / axis.y), 2)));
    var dx = (axis.x / axis.y) * dy;
    return { x: px.x + Math.abs(dx) * sign_x, y: px.y + Math.abs(dy) * sign_y };
  }
  
  var centroid = annotorious.shape.geom.Polygon.computeCentroid(points);
  var expanded = [];
    
  for (var i=0; i<points.length; i++) {
    expanded.push(shiftAlongAxis(points[i], centroid, delta));
  }
    
  return expanded;
}

annotorious.shape.geom.Polygon.expandPolygon = function(points, delta) {
  return annotorious.shape.geom.Polygon._expandTriangle(points, delta);
}


